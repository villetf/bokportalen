import { plainToInstance } from 'class-transformer';
import { AppDataSource } from '../data-source.js';
import { Author, AuthorLifeStatus } from '../entities/Author.js';
import { FindOptionsWhere, Like } from 'typeorm';
import { AuthorRequestDTO } from '../dto/AuthorRequestDTO.js';
import { CountriesService } from './countries.services.js';
import { AuthorUpdateDTO } from '../dto/AuthorUpdateDTO.js';

export class InvalidAuthorLifeDataError extends Error {
   constructor(message: string) {
      super(message);
      this.name = 'InvalidAuthorLifeDataError';
   }
}

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
      const lifeStatus = author.lifeStatus ?? 'unknown';
      const deathYear = author.deathYear ?? null;
      this.validateLifeData(lifeStatus, deathYear, author.birthYear);

      const newAuthor = new Author();
      newAuthor.firstName = author.firstName;
      newAuthor.lastName = author.lastName;
      newAuthor.gender = author.gender;
      newAuthor.birthYear = author.birthYear;
      newAuthor.deathYear = deathYear;
      newAuthor.lifeStatus = lifeStatus;
      const country = await CountriesService.getCountryById(author.country!);
      newAuthor.country = country;
      newAuthor.imageLink = author.imageLink;
      const createdAuthor = await AppDataSource.getRepository(Author).save(newAuthor);
      return plainToInstance(Author, createdAuthor);
   }

   static async updateAuthor(author: Author, updatedFields: AuthorUpdateDTO) {
      const lifeStatus = updatedFields.lifeStatus ?? author.lifeStatus;
      const deathYear = updatedFields.deathYear !== undefined ? updatedFields.deathYear : author.deathYear;
      const birthYear = updatedFields.birthYear !== undefined ? updatedFields.birthYear : author.birthYear;
      this.validateLifeData(lifeStatus, deathYear, birthYear);

      // Tilldelar de nya fälten till författaren utan att påverka de övriga
      Object.assign(author, updatedFields);
      if (updatedFields.countryId) {
         author.country = await CountriesService.getCountryById(updatedFields.countryId);
      }
      await AppDataSource.getRepository(Author).save(author);
   }

   private static validateLifeData(lifeStatus: AuthorLifeStatus, deathYear: number | null, birthYear: number | null) {
      if (lifeStatus === 'alive' && deathYear !== null) {
         throw new InvalidAuthorLifeDataError('A confirmed living author cannot have a death year');
      }

      if (deathYear !== null && lifeStatus !== 'deceased') {
         throw new InvalidAuthorLifeDataError('An author with a death year must be marked as deceased');
      }

      if (birthYear !== null && deathYear !== null && deathYear < birthYear) {
         throw new InvalidAuthorLifeDataError('A death year cannot be before a birth year');
      }
   }
}
