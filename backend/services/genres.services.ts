import { AppDataSource } from '../data-source.js';
import { Genre } from '../entities/Genre.js';
import { capitalizeWord } from '../helpers/helpers.js';

export class GenresService {
   static async getAllGenres() : Promise<Genre[]> {
      const allGenres = await AppDataSource.getRepository(Genre).find();
      return allGenres;
   }

   static async getGenreByName(genreName: string): Promise<Genre | null> {
      const genre = await AppDataSource.getRepository(Genre)
         .createQueryBuilder('genre')
         .where('LOWER(genre.name) = LOWER(:name)', { name: genreName })
         .getOne();

      return genre;
   }

   static async getGenreById(id: number): Promise<Genre | null> {
      return await AppDataSource.getRepository(Genre).findOneBy({ id });
   }

   static async addGenre(genreName: string): Promise<Genre> {
      const newGenre = new Genre();
      genreName = genreName.trim();
      genreName = capitalizeWord(genreName);
      newGenre.name = genreName;

      return await AppDataSource.getRepository(Genre).save(newGenre);
   }
}