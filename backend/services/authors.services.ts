import { AppDataSource } from '../data-source.js';
import { Author } from '../entities/Author.js';
import { FindOptionsWhere, ILike } from 'typeorm';
export class AuthorsService {
   static async getAuthorById(authorId: number): Promise<Author | null> {
      const author = await AppDataSource.getRepository(Author).findOne({
         where: { id: authorId },
      });


      return author;
   }

   static async getAuthorByName(firstName: string, lastName?: string): Promise<Author | null> {
      const where: FindOptionsWhere<Author> = {
         firstName: ILike(firstName),
      };

      if (lastName) {
         where.lastName = ILike(lastName);
      }

      return await AppDataSource.getRepository(Author).findOne({ where });
   }

   static async getAuthorsByQuery(firstName: string, lastName: string): Promise<Author | null> {
      let authorQuery = AppDataSource.getRepository(Author)
         .createQueryBuilder('author');

      if (firstName) {
         authorQuery = authorQuery.where('LOWER(author.firstName) = LOWER(:firstName)', { firstName });
      }

      if (lastName) {
         authorQuery = authorQuery
            .andWhere('LOWER(author.lastName) = LOWER(:lastName)', { lastName });
      }

      const author = await authorQuery.getOne();

      return author;
   }
}