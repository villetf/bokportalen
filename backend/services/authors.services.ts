import { plainToInstance } from 'class-transformer';
import { AppDataSource } from '../data-source.js';
import { Author } from '../entities/Author.js';
import { FindOptionsWhere, Like } from 'typeorm';
import { AuthorRequestDTO } from '../dto/AuthorRequestDTO.js';
import { CountriesService } from './countries.services.js';

export class AuthorsService {
   static async getAllAuthors(): Promise<Author[]> {
      const authors = await AppDataSource.getRepository(Author).find({
         relations: ['country']
      });
      return plainToInstance(Author, authors);
   }

   static async getAuthorById(authorId: number): Promise<Author | null> {
      const author = await AppDataSource.getRepository(Author).findOne({
         where: { id: authorId },
         relations: ['country'],
      });

      return plainToInstance(Author, author);
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

      return plainToInstance(Author, authors);
   }

   static async createAuthor(author: AuthorRequestDTO): Promise<Author> {
      const newAuthor = new Author();
      newAuthor.firstName = author.firstName;
      newAuthor.lastName = author.lastName;
      newAuthor.gender = author.gender;
      newAuthor.birthYear = author.birthYear;
      const country = await CountriesService.getCountryById(author.country!);
      newAuthor.country = country;
      const createdAuthor = await AppDataSource.getRepository(Author).save(newAuthor);
      return plainToInstance(Author, createdAuthor);
   }
}