import type { Request, Response } from 'express';
import { GenresService } from '../services/genres.services.js';

export class GenresController {
   static async getAllGenres(req: Request, res: Response) {
      const genres = await GenresService.getAllGenres();
      res.json(genres);
   }

   static async addGenre(req: Request, res: Response) {
      if (await GenresService.getGenreByName(req.body.name)) {
         res.status(409).json({ message: 'Genre already exists' });
         return;
      }
      const newGenre = await GenresService.addGenre(req.body.name);
      res.status(201).json(newGenre);
   }
}
