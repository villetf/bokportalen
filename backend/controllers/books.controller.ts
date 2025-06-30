import type { Request, Response } from 'express';
import { BooksService } from '../services/books.services.js';

export class BooksController {
   static async getAllBooks(req: Request, res: Response) {
      const books = await BooksService.getAllBooks();
      res.json(books);
   }

   // static async create(req: Request, res: Response) {
   //    const user = AppDataSource.getRepository(User).create(req.body);
   //    const result = await AppDataSource.getRepository(User).save(user);
   //    res.status(201).json(result);
   // }
}