import type { Request, Response } from 'express';
import { BooksService } from '../services/books.services.js';
import { Book } from '../entities/Book.js';
import { BookRequestDTO } from '../dto/BookRequestDTO.js';
import { BookUpdateDTO } from '../dto/BookUpdateDTO.js';

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

   static async getBookById(req: Request, res: Response) {
      const book = await BooksService.getBookById(Number.parseInt(req.params.id));
      if (book) {
         res.json({
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
         });
      } else {
         res.status(404).json({ error: 'Book not found' });
      }
   }

   static async createBook(req: Request, res: Response) {
      const newBook = await BooksService.createBook(req.body as BookRequestDTO);
      res.status(201).json(newBook);
   }

   static async updateBook(req: Request, res: Response) {
      const bookToUpdate = await BooksService.getBookById(Number.parseInt(req.params.id));
      if (!bookToUpdate) {
         res.status(404).json({ error: 'Book not found' });
         return;
      }
      await BooksService.updateBook(bookToUpdate, req.body as BookUpdateDTO);

      const updatedBook = await BooksService.getBookById(Number.parseInt(req.params.id));

      res.json(updatedBook);
   }

   static async markBookAsDeleted(req: Request, res: Response) {
      const book = await BooksService.getBookById(Number.parseInt(req.params.id));
      if (book) {
         await BooksService.markBookAsDeleted(book);
         res.status(204).send();
      } else {
         res.status(404).json({ error: 'Book not found' });
      }
   }
}