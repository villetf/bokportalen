import type { Request, Response } from 'express';
import { BooksService } from '../services/books.services.js';
import { Book } from '../entities/Book.js';
import { BookRequestDTO } from '../dto/BookRequestDTO.js';
import { BookUpdateDTO } from '../dto/BookUpdateDTO.js';
import { LanguagesService } from '../services/languages.services.js';
import { GenresService } from '../services/genres.services.js';
import { AuthorsService } from '../services/authors.services.js';

export class BooksController {
   static async getAllBooks(req: Request, res: Response) {
      try {
         const books = await BooksService.getBooksByQuery(req.query);

         // Mappar om egenskaperna på varje bok för att ändra ordning och välja vilka man vill visa
         res.json(books.map((book: Book) => ({
            id: book.id,
            title: book.title,
            authors: book.authors,
            yearWritten: book.yearWritten,
            language: book.language,
            originalLanguage: book.originalLanguage,
            genre: book.genre,
            format: book.format,
            isbn: book.isbn,
            status: book.status,
            rating: book.rating,
            createdAt: book.createdAt,
            addedWithScanner: book.addedWithScanner,
            copies: book.copies,
            isDeleted: book.isDeleted,
            coverLink: book.coverLink
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
      if (!book) {
         res.status(404).json({ error: 'Book not found' });
         return;
      }

      // Returnerar objektet med skräddarsydda egenskaper
      res.json({
         id: book.id,
         title: book.title,
         authors: book.authors,
         yearWritten: book.yearWritten,
         language: book.language,
         originalLanguage: book.originalLanguage,
         genre: book.genre,
         format: book.format,
         isbn: book.isbn,
         status: book.status,
         rating: book.rating,
         createdAt: book.createdAt,
         addedWithScanner: book.addedWithScanner,
         copies: book.copies,
         isDeleted: book.isDeleted,
         coverLink: book.coverLink
      });
   }

   static async createBook(req: Request, res: Response) {
      const checkBookReq = {
         title: (req.body as BookRequestDTO).title,
         authorFirstName: (await AuthorsService.getAuthorById((req.body as BookRequestDTO).authors[0]))?.firstName,
         authorLastName: (await AuthorsService.getAuthorById((req.body as BookRequestDTO).authors[0]))?.lastName
      };

      if ((await BooksService.getBooksByQuery(checkBookReq)).length > 0) {
         res.status(409).json({ message: 'Book already exists' });
         return;
      }

      const newBook = await BooksService.createBook(req.body as BookRequestDTO);
      res.status(201).json(newBook);
   }

   static async updateBook(req: Request, res: Response) {
      const bookToUpdate = await BooksService.getBookById(Number.parseInt(req.params.id));
      if (!bookToUpdate) {
         res.status(404).json({ error: 'Book not found' });
         return;
      }

      if (req.body.language) {
         const language = await LanguagesService.getLanguageById(req.body.language);
         req.body.language = language;
      }

      if (req.body.originalLanguage) {
         const originalLanguage = await LanguagesService.getLanguageById(req.body.originalLanguage);
         req.body.originalLanguage = originalLanguage;
      }

      if (req.body.genre) {
         const genre = await GenresService.getGenreById(req.body.genre);
         req.body.genre = genre;
      }

      await BooksService.updateBook(bookToUpdate, req.body as BookUpdateDTO);

      const updatedBook = await BooksService.getBookById(Number.parseInt(req.params.id));

      res.json({
         id: updatedBook!.id,
         title: updatedBook!.title,
         authors: updatedBook!.authors,
         yearWritten: updatedBook!.yearWritten,
         language: updatedBook!.language,
         originalLanguage: updatedBook!.originalLanguage,
         genre: updatedBook!.genre,
         format: updatedBook!.format,
         isbn: updatedBook!.isbn,
         status: updatedBook!.status,
         rating: updatedBook!.rating,
         createdAt: updatedBook!.createdAt,
         addedWithScanner: updatedBook!.addedWithScanner,
         copies: updatedBook!.copies,
         isDeleted: updatedBook!.isDeleted,
         coverLink: updatedBook!.coverLink
      });
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