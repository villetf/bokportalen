import { AppDataSource } from '../data-source.js';
import { Genre } from '../entities/Genre.js';
import { capitalizeWord } from '../helpers/helpers.js';

export class GenresService {
   static async getGenreByName(genreName: string): Promise<Genre | null> {
      const genre = await AppDataSource.getRepository(Genre)
         .createQueryBuilder('genre')
         .where('LOWER(genre.name) = LOWER(:name)', { name: genreName })
         .getOne();

      return genre;
   }

   static async addGenre(genreName: string): Promise<Genre> {
      const newGenre = new Genre();
      genreName = capitalizeWord(genreName);
      newGenre.name = genreName;

      return await AppDataSource.getRepository(Genre).save(newGenre);
   }
}