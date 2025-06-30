import { AppDataSource } from '../data-source.js';
import { Book } from '../entities/Book.js';
import type { Request } from 'express';

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

   // static create(data: Partial<User>) {
   //    const user = AppDataSource.getRepository(User).create(data);
   //    return AppDataSource.getRepository(User).save(user);
   // }
}