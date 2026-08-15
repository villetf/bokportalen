import { AppDataSource } from '../data-source.js';
import { BookRequestDTO } from '../dto/BookRequestDTO.js';
import { Book } from '../entities/Book.js';
import { AuthorsService } from './authors.services.js';
import { GenresService } from './genres.services.js';
import { LanguagesService } from './languages.services.js';
import { BookUpdateDTO } from '../dto/BookUpdateDTO.js';
import dotenv from 'dotenv';
import type { GoogleBooksResponse, ISBNLookupResponse, OpenLibraryBook } from '../types/books-isbn.types.js';
dotenv.config();

export class BooksService {
   static async getBooksByQuery(queryParams: Record<string, unknown>) {
      const queryBuilder = AppDataSource.getRepository(Book)
         .createQueryBuilder('book')
         .leftJoinAndSelect('book.authors', 'author')
         .leftJoinAndSelect('author.country', 'country')
         .leftJoinAndSelect('book.language', 'language')
         .leftJoinAndSelect('book.originalLanguage', 'originalLanguage')
         .leftJoinAndSelect('book.genre', 'genre');

      // Skapar en lista över giltiga filter
      const validFilters: Record<string, string> = {
         title: 'book.title',
         authorFirstName: 'author.firstName',
         authorLastName: 'author.lastName',
         yearWritten: 'book.year_written',
         language: 'language.name',
         originalLanguage: 'originalLanguage.name',
         genre: 'genre.name',
         format: 'book.format',
         isbn: 'book.isbn',
      };

      // För varje inskickad filterparameter, kolla att den finns i listan över giltiga filter
      for (const key in queryParams) {
         if (!validFilters[key]) {
            // Specialhantering för includeDeleted, eftersom det inte är ett filter utan ett val
            if (key != 'includeDeleted') {
               throw new Error(`Invalid filter: ${key}`);
            }
         }
      }

      // Gå igenom alla giltiga filter, om queryn innehåller filtret, lägg till det på queryn till databasen
      for (const [paramKey, dbField] of Object.entries(validFilters)) {
         const value = queryParams[paramKey];
         if (value) {
            queryBuilder.andWhere(`${dbField} = :${paramKey}`, {
               [paramKey]: value
            });
         }
      }

      // Om det inte specificerats, sätt att raderade böcker inte ska visas
      if (queryParams.includeDeleted != 'true') {
         queryBuilder.andWhere('book.isDeleted = :isDeleted', { isDeleted: false });
      }

      const books = await queryBuilder.getMany();

      return books;
   }

   static async getBookById(id: number) {
      return AppDataSource.getRepository(Book).findOne({
         where: { id },
         relations: ['authors', 'language', 'originalLanguage', 'genre']
      });
   }

   static async getDeletedBooks() {
      return AppDataSource.getRepository(Book).find({
         where: { isDeleted: true },
         relations: ['authors', 'language', 'originalLanguage', 'genre']
      });
   }

   static async createBook(inputBook: BookRequestDTO) {
      let language = null;

      // Om språk, originalspråk och genre anges, hämta eller kasta fel
      if (inputBook.language) {
         language = await LanguagesService.getLanguageById(inputBook.language);
         if (!language) {
            throw new Error('Language not found');
         }
      }

      let originalLanguage = null;
      if (inputBook.originalLanguage) {
         originalLanguage = await LanguagesService.getLanguageById(inputBook.originalLanguage);
         if (!originalLanguage) {
            throw new Error('Original language not found');
         }
      }

      let genre = null;
      if (inputBook.genre) {
         genre = await GenresService.getGenreById(inputBook.genre);
         if (!genre) {
            throw new Error('Genre not found');
         }
      }

      const newBook = new Book();
      newBook.title = inputBook.title;
      newBook.authors = [];
      for (const authorId of inputBook.authors) {
         const author = await AuthorsService.getAuthorById(authorId);
         if (!author) {
            throw new Error(`Author with ID ${authorId} not found`);
         }
         newBook.authors.push(author);
      }
      newBook.yearWritten = inputBook.yearWritten ? inputBook.yearWritten : null;
      newBook.isbn = inputBook.isbn ? inputBook.isbn : null;
      newBook.language = language;
      newBook.originalLanguage = originalLanguage;
      newBook.genre = genre;
      newBook.format = inputBook.format ? inputBook.format : null;
      newBook.isDeleted = false;
      newBook.createdAt = new Date();
      newBook.addedWithScanner = inputBook.addedWithScanner ? inputBook.addedWithScanner : false;
      newBook.coverLink = inputBook.coverLink ? inputBook.coverLink : null;

      return AppDataSource.getRepository(Book).save(newBook);
   }

   static async updateBook(book: Book, updateData: Partial<BookUpdateDTO>) {
      Object.assign(book, updateData);
      await AppDataSource.getRepository(Book).save(book);
   }

   static async markBookAsDeleted(book: Book) {
      book.isDeleted = true;
      return AppDataSource.getRepository(Book).save(book);
   }

   static async getBookByIsbn(isbn: string): Promise<ISBNLookupResponse> {
      const normalizedIsbn = isbn.replace(/[^0-9Xx]/g, '');

      if (!normalizedIsbn) {
         throw new Error('Invalid ISBN');
      }

      const [googleBooksResult, openLibraryResult] = await Promise.allSettled([
         fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${normalizedIsbn}&key=${process.env.GOOGLE_BOOKS_KEY}`),
         fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${normalizedIsbn}&format=json&jscmd=data`)
      ]);

      if (googleBooksResult.status === 'fulfilled' && !googleBooksResult.value.ok) {
         console.error(
            'Google Books API returned error:', googleBooksResult.value.status, googleBooksResult.value.statusText
         );
      }

      if (openLibraryResult.status === 'fulfilled' && !openLibraryResult.value.ok) {
         console.error(
            'OpenLibrary API returned error:', openLibraryResult.value.status, openLibraryResult.value.statusText
         );
      }

      const googleBooksData = await this.readGoogleBooksResponse(googleBooksResult);
      const openLibraryData = await this.readOpenLibraryResponse(openLibraryResult, normalizedIsbn);

      const googleVolume = googleBooksData?.items?.[0]?.volumeInfo;
      const openLibraryVolume = openLibraryData;

      const title = googleVolume?.title ?? openLibraryVolume?.title ?? null;
      const subtitle = googleVolume?.subtitle ?? openLibraryVolume?.subtitle ?? null;
      const authors = this.uniqueStrings([
         ...(googleVolume?.authors ?? []),
         ...(openLibraryVolume?.authors?.map((author) => author.name).filter((name): name is string => Boolean(name)) ?? [])
      ]);

      const publishedDate = googleVolume?.publishedDate ?? openLibraryVolume?.publish_date ?? null;
      const publishedYear = this.extractYear(publishedDate);
      const language = googleVolume?.language ?? openLibraryVolume?.languages?.[0]?.name ?? openLibraryVolume?.languages?.[0]?.key ?? null;
      const categories = this.uniqueStrings([
         ...(googleVolume?.categories ?? []),
         ...(openLibraryVolume?.subjects?.map((subject) => subject.name).filter((name): name is string => Boolean(name)) ?? [])
      ]);
      const coverLink = openLibraryVolume?.cover?.large ?? openLibraryVolume?.cover?.medium ?? openLibraryVolume?.cover?.small ?? googleVolume?.imageLinks?.thumbnail ?? googleVolume?.imageLinks?.smallThumbnail ?? null;

      return {
         isbn: normalizedIsbn,
         found: Boolean(title || authors.length || coverLink || publishedDate),
         title,
         subtitle,
         authors,
         publishedYear,
         language,
         categories,
         coverLink,
         sources: {
            googleBooks: Boolean(googleVolume),
            openLibrary: Boolean(openLibraryVolume)
         }
      };
   }

   private static async readGoogleBooksResponse(result: PromiseSettledResult<Response>) {
      if (result.status !== 'fulfilled' || !result.value.ok) {
         return null;
      }

      return (await result.value.json()) as GoogleBooksResponse;
   }

   private static async readOpenLibraryResponse(result: PromiseSettledResult<Response>, isbn: string) {
      if (result.status !== 'fulfilled' || !result.value.ok) {
         return null;
      }

      const payload = (await result.value.json()) as Record<string, OpenLibraryBook>;
      return payload[`ISBN:${isbn}`] ?? null;
   }

   private static extractYear(value: string | null | undefined) {
      if (!value) {
         return null;
      }

      const match = value.match(/\b(\d{4})\b/);
      return match ? Number.parseInt(match[1]) : null;
   }

   private static uniqueStrings(values: Array<string | undefined | null>) {
      return [...new Set(values.filter((value): value is string => Boolean(value)).map((value) => value.trim()).filter((value) => value.length > 0))];
   }
}