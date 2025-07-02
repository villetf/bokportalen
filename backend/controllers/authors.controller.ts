import type { Request, Response } from 'express';
import { AuthorsService } from '../services/authors.services.js';

export class AuthorsController {
   static async getAllAuthors(req: Request, res: Response) {
      const { firstName, lastName } = req.query;
      const author = await AuthorsService.getAuthorByName(firstName as string, lastName as string);
      if (!author) {
         res.status(404).json({ error: 'Author not found' });
      }

      res.json(author);
   }
}