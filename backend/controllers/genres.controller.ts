import type { Request, Response } from 'express';
import { GenresService } from '../services/genres.services.js';
import { capitalizeWord } from '../helpers/helpers.js';

export class GenresController {
   static async getAllGenres(req: Request, res: Response) {
      const genres = await GenresService.getAllGenres();
      res.json(genres);
   }

   static async addGenre(req: Request, res: Response) {
      let genreName = req.body.name.trim();
      genreName = capitalizeWord(genreName);
      if (await GenresService.getGenreByName(genreName)) {
         res.status(409).json({ message: 'Genre already exists' });
         return;
      }
      const newGenre = await GenresService.addGenre(genreName);
      res.status(201).json(newGenre);
   }
}
