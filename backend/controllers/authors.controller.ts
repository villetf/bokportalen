import type { Request, Response } from 'express';
import { AuthorsService } from '../services/authors.services.js';
import { plainToInstance } from 'class-transformer';
import { Author } from '../entities/Author.js';

export class AuthorsController {
   static async getAuthors(req: Request, res: Response) {
      if (req.query === undefined || Object.keys(req.query).length === 0) {
         const allAuthors = await AuthorsService.getAllAuthors();
         res.json(plainToInstance(Author, allAuthors, {
            excludeExtraneousValues: true,
         }));
         return;
      }

      const { firstName, lastName } = req.query;
      const authors = await AuthorsService.getAuthorsByQuery(firstName as string, lastName as string);
      if (authors.length === 0) {
         res.status(404).json({ error: 'Author not found' });
         return;
      }

      res.json(plainToInstance(Author, authors, {
         excludeExtraneousValues: true,
      }));
   }

   static async getAuthorById(req: Request, res: Response) {
      const { id } = req.params;
      const author = await AuthorsService.getAuthorById(Number(id));
      if (!author) {
         res.status(404).json({ error: 'Author not found' });
         return;
      }
      res.json(plainToInstance(Author, author, {
         excludeExtraneousValues: true,
      }));
   }
}