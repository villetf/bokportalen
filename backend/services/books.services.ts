import { AppDataSource } from '../data-source.js';
import { Book } from '../entities/Book.js';

export class BooksService {
   static async getAllBooks() {
      const books = await AppDataSource.getRepository(Book).find({
         where: { isDeleted: false },
         relations: ['authors', 'language', 'originalLanguage', 'genre']
      });

      return books.map((book) => ({
         id: book.id,
         title: book.title,
         author: book.authors,
         yearWritten: book.yearWritten,
         language: book.language,
         originalLanguage: book.originalLanguage,
         genre: book.genre,
         format: book.format,
         isbn: book.isbn,
         status: book.status,
         rating: book.rating,
         isDeleted: book.isDeleted
      }));
   }

   // static create(data: Partial<User>) {
   //    const user = AppDataSource.getRepository(User).create(data);
   //    return AppDataSource.getRepository(User).save(user);
   // }
}