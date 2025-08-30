import type { Request, Response } from 'express';
import { GenresService } from '../services/genres.services.js';

export class GenresController {
   static async getAllGenres(req: Request, res: Response) {
      const genres = await GenresService.getAllGenres();
      res.json(genres);
   }
}
