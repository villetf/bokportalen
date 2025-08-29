import type { Request, Response } from 'express';
import { AuthorsService } from '../services/authors.services.js';

export class AuthorsController {
   static async getAuthors(req: Request, res: Response) {
      if (req.query === undefined || Object.keys(req.query).length === 0) {
         const allAuthors = await AuthorsService.getAllAuthors();
         res.json(allAuthors);
         return;
      }

      const { firstName, lastName } = req.query;
      const authors = await AuthorsService.getAuthorsByQuery(firstName as string, lastName as string);
      if (authors.length === 0) {
         res.status(404).json({ error: 'Author not found' });
         return;
      }

      res.json(authors);
   }
}