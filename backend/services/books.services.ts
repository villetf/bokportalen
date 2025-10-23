import { AppDataSource } from '../data-source.js';
import { BookRequestDTO } from '../dto/BookRequestDTO.js';
import { Book } from '../entities/Book.js';
import { AuthorsService } from './authors.services.js';
import { GenresService } from './genres.services.js';
import { LanguagesService } from './languages.services.js';
import { BookUpdateDTO } from '../dto/BookUpdateDTO.js';

export class BooksService {
   static async getBooksByQuery(queryParams: Record<string, unknown>) {
      const queryBuilder = AppDataSource.getRepository(Book)
         .createQueryBuilder('book')
         .leftJoinAndSelect('book.authors', 'author')
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
         status: 'book.status',
         rating: 'book.rating',
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
      newBook.status = null;
      newBook.rating = null;
      newBook.isDeleted = false;
      newBook.createdAt = new Date();
      newBook.copies = 1;
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
}