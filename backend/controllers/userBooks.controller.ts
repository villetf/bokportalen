import type { Request, Response } from 'express';
import { UsersService } from '../services/users.services.js';
import { UserBooksService } from '../services/userBooks.services.js';
import { UserBook } from '../entities/UserBook.js';
import { UserBookRequestDTO } from '../dto/UserBookRequestDTO.js';
import { UserBookUpdateDTO } from '../dto/UserBookUpdateDTO.js';
import { User } from '../entities/User.js';

async function getCurrentDbUser(req: Request, res: Response): Promise<User | null> {
   if (!req.user) {
      res.status(401).json({ message: 'No user found' });
      return null;
   }

   const firebaseUser = req.user;
   let dbUser: User | null;
   dbUser = await UsersService.getFirebaseUser(firebaseUser.uid);

   if (!dbUser) {
      dbUser = await UsersService.createUserLocally(firebaseUser);
   }

   if (firebaseUser.email && dbUser.email !== firebaseUser.email) {
      await UsersService.correctLocalEmail(firebaseUser.email, firebaseUser.uid);
      dbUser.email = firebaseUser.email;
   }

   return dbUser;
}

function mapUserBook(userBook: UserBook) {
   const book = userBook.book;
   return {
      id: book.id,
      title: book.title,
      authors: book.authors,
      yearWritten: book.yearWritten,
      language: book.language,
      originalLanguage: book.originalLanguage,
      genre: book.genre,
      format: book.format,
      isbn: book.isbn,
      createdAt: book.createdAt,
      addedWithScanner: book.addedWithScanner,
      isDeleted: book.isDeleted,
      coverLink: book.coverLink,
      status: userBook.status,
      rating: userBook.rating,
      copies: userBook.copies,
   };
}

export class UserBooksController {
   static async getCurrentUserBooks(req: Request, res: Response) {
      const dbUser = await getCurrentDbUser(req, res);
      if (!dbUser) {
         return;
      }

      const includeZeroCopies = req.query.includeZeroCopies === 'true';
      const userBooks = await UserBooksService.getUserBooks(dbUser.id, includeZeroCopies);

      res.json(userBooks.map(mapUserBook));
   }

   static async getCurrentUserBookById(req: Request, res: Response) {
      const dbUser = await getCurrentDbUser(req, res);
      if (!dbUser) {
         return;
      }

      const bookId = Number.parseInt(req.params.bookId);
      if (Number.isNaN(bookId)) {
         res.status(400).json({ error: 'Invalid book id' });
         return;
      }

      const userBook = await UserBooksService.getUserBookByBookId(dbUser.id, bookId);
      if (!userBook) {
         res.status(404).json({ error: 'Book not found in shelf' });
         return;
      }

      res.json(mapUserBook(userBook));
   }

   static async addCurrentUserBook(req: Request, res: Response) {
      const dbUser = await getCurrentDbUser(req, res);
      if (!dbUser) {
         return;
      }

      try {
         const userBook = await UserBooksService.createOrUpdateUserBook(dbUser.id, req.body as UserBookRequestDTO);
         res.json(mapUserBook(userBook!));
      } catch (error) {
         if (error instanceof Error && error.message === 'Book not found') {
            res.status(404).json({ error: 'Book not found' });
            return;
         }
         console.error('Error creating user book:', error);
         res.status(500).json({ error: 'Internal server error' });
      }
   }

   static async updateCurrentUserBook(req: Request, res: Response) {
      const dbUser = await getCurrentDbUser(req, res);
      if (!dbUser) {
         return;
      }

      const bookId = Number.parseInt(req.params.bookId);
      if (Number.isNaN(bookId)) {
         res.status(400).json({ error: 'Invalid book id' });
         return;
      }

      const userBook = await UserBooksService.updateUserBook(dbUser.id, bookId, req.body as UserBookUpdateDTO);
      if (!userBook) {
         res.status(404).json({ error: 'Book not found in shelf' });
         return;
      }

      res.json(mapUserBook(userBook));
   }

   static async removeCurrentUserBook(req: Request, res: Response) {
      const dbUser = await getCurrentDbUser(req, res);
      if (!dbUser) {
         return;
      }

      const bookId = Number.parseInt(req.params.bookId);
      if (Number.isNaN(bookId)) {
         res.status(400).json({ error: 'Invalid book id' });
         return;
      }

      const userBook = await UserBooksService.setUserBookCopies(dbUser.id, bookId, 0);
      if (!userBook) {
         res.status(404).json({ error: 'Book not found in shelf' });
         return;
      }

      res.json(mapUserBook(userBook));
   }
}
