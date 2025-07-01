import { AppDataSource } from '../data-source.js';
import { Author } from '../entities/Author.js';

export class AuthorsService {
   // static async getAuthorsByBookId(bookId: number) : Promise<Author[]> {
   //    const book = await AppDataSource.getRepository(Book).findOne({
   //       where: { id: bookId },
   //       relations: ['authors'],
   //    });


   //    return book ? book.authors : [];
   // }

   static async getAuthorById(authorId: number): Promise<Author> {
      const author = await AppDataSource.getRepository(Author).findOne({
         where: { id: authorId },
      });

      if (!author) {
         throw new Error('404');
      }

      return author;
   }
}