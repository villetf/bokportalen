import { AppDataSource } from '../data-source.js';
import { Author } from '../entities/Author.js';
import { Book } from '../entities/Book.js';

export class AuthorsService {
   static async getAuthorsByBookId(bookId: number) : Promise<Author[]> {
      const book = await AppDataSource.getRepository(Book).findOne({
         where: { id: bookId },
         relations: ['authors'],
      });


      return book ? book.authors : [];
   }


}