import { AppDataSource } from '../data-source.js';
import { BookRequestDTO } from '../dto/BookRequestDTO.js';
import { Book } from '../entities/Book.js';
import type { Request } from 'express';
import { AuthorsService } from './authors.services.js';
import { GenresService } from './genres.services.js';
import { LanguagesService } from './languages.services.js';

export class BooksService {
   static async getBooksByQuery(req: Request) {
      const queryBuilder = AppDataSource.getRepository(Book)
         .createQueryBuilder('book')
         .leftJoinAndSelect('book.authors', 'author')
         .leftJoinAndSelect('book.language', 'language')
         .leftJoinAndSelect('book.originalLanguage', 'originalLanguage')
         .leftJoinAndSelect('book.genre', 'genre');

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

      for (const key in req.query) {
         if (!validFilters[key]) {
            throw new Error(`Invalid filter: ${key}`);
         }
      }

      for (const [paramKey, dbField] of Object.entries(validFilters)) {
         const value = req.query[paramKey];
         if (value) {
            queryBuilder.andWhere(`${dbField} = :${paramKey}`, {
               [paramKey]: value
            });
         }
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

   static async createBook(inputBook: BookRequestDTO) {
      console.log('Creating book with data:', inputBook);

      let language = null;

      if (inputBook.language) {
         language = await LanguagesService.getLanguageByName(inputBook.language);
         if (!language) {
            language = await LanguagesService.addLanguage(inputBook.language);
         }
      }

      let originalLanguage = null;
      if (inputBook.originalLanguage) {
         originalLanguage = await LanguagesService.getLanguageByName(inputBook.originalLanguage);
         if (!originalLanguage) {
            originalLanguage = await LanguagesService.addLanguage(inputBook.originalLanguage);
         }
      }

      let genre = null;
      if (inputBook.genre) {
         genre = await GenresService.getGenreByName(inputBook.genre);
         if (!genre) {
            genre = await GenresService.addGenre(inputBook.genre);
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

      console.log('New book to be saved:', newBook);

      return AppDataSource.getRepository(Book).save(newBook);
   }
}