import { AppDataSource } from '../data-source.js';
import { Author } from '../entities/Author.js';
import { FindOptionsWhere, Like } from 'typeorm';

export class AuthorsService {
   static async getAllAuthors(): Promise<Author[]> {
      const authors = await AppDataSource.getRepository(Author).find({
         relations: ['country']
      });
      return authors;
   }

   static async getAuthorById(authorId: number): Promise<Author | null> {
      const author = await AppDataSource.getRepository(Author).findOne({
         where: { id: authorId },
         relations: ['country'],
      });

      return author;
   }

   static async getAuthorsByQuery(firstName: string, lastName: string): Promise<Author[]> {
      const where: FindOptionsWhere<Author> = {};

      if (firstName) {
         where.firstName = Like(firstName);
      }

      if (lastName) {
         where.lastName = Like(lastName);
      }

      const authors = await AppDataSource.getRepository(Author).find({
         where,
         relations: ['country'],
      });

      return authors;
   }
}