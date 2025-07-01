import type { Request, Response } from 'express';
import { BooksService } from '../services/books.services.js';
import { Book } from '../entities/Book.js';
import { BookRequestDTO } from '../dto/BookRequestDTO.js';

export class BooksController {
   static async getAllBooks(req: Request, res: Response) {
      try {
         const books = await BooksService.getBooksByQuery(req);
         
         res.json(books.map((book: Book) => ({
            id: book.id,
            title: book.title,
            author: book.authors,
            yearWritten: book.yearWritten,
            language: book.language,
            originalLanguage: book.originalLanguage,
            genre: book.genre,
            format: book.format,
            isbn: book.isbn,
            status: book.status,
            rating: book.rating,
            isDeleted: book.isDeleted
         })));
      } catch (error) {
         if (error instanceof Error) {
            if (error.message.includes('Invalid filter')) {
               res.status(400).json({ error: error.message });
            } else {
               console.error('Error fetching books:', error);
               res.status(500).json({ error: 'Internal server error' });
            }
         } else {
            console.error('Unexpected error:', error);
            res.status(500).json({ error: 'An unexpected error occurred' });
         }
      }
   }

   static async createBook(req: Request, res: Response) {
      const newBook = BooksService.createBook(req.body as BookRequestDTO);
      res.status(201).json(newBook);
   }
}