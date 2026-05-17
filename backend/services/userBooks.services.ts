import { AppDataSource } from '../data-source.js';
import { UserBook } from '../entities/UserBook.js';
import { Book } from '../entities/Book.js';
import { UserBookRequestDTO } from '../dto/UserBookRequestDTO.js';
import { UserBookUpdateDTO } from '../dto/UserBookUpdateDTO.js';

export class UserBooksService {
   static async getUserBooks(userId: number, includeZeroCopies: boolean) {
      const queryBuilder = AppDataSource.getRepository(UserBook)
         .createQueryBuilder('userBook')
         .leftJoinAndSelect('userBook.book', 'book')
         .leftJoinAndSelect('book.authors', 'author')
         .leftJoinAndSelect('author.country', 'country')
         .leftJoinAndSelect('book.language', 'language')
         .leftJoinAndSelect('book.originalLanguage', 'originalLanguage')
         .leftJoinAndSelect('book.genre', 'genre')
         .where('userBook.userId = :userId', { userId })
         .andWhere('book.isDeleted = :isDeleted', { isDeleted: false });

      if (!includeZeroCopies) {
         queryBuilder.andWhere('userBook.copies > 0');
      }

      return queryBuilder.getMany();
   }

   static async getUserBookByBookId(userId: number, bookId: number) {
      return AppDataSource.getRepository(UserBook)
         .createQueryBuilder('userBook')
         .leftJoinAndSelect('userBook.book', 'book')
         .leftJoinAndSelect('book.authors', 'author')
         .leftJoinAndSelect('author.country', 'country')
         .leftJoinAndSelect('book.language', 'language')
         .leftJoinAndSelect('book.originalLanguage', 'originalLanguage')
         .leftJoinAndSelect('book.genre', 'genre')
         .where('userBook.userId = :userId', { userId })
         .andWhere('userBook.bookId = :bookId', { bookId })
         .getOne();
   }

   static async createOrUpdateUserBook(userId: number, payload: UserBookRequestDTO) {
      const bookRepo = AppDataSource.getRepository(Book);
      const book = await bookRepo.findOne({ where: { id: payload.bookId } });
      if (!book) {
         throw new Error('Book not found');
      }

      const repo = AppDataSource.getRepository(UserBook);
      let userBook = await repo.findOne({ where: { userId, bookId: payload.bookId } });

      if (!userBook) {
         userBook = repo.create({
            userId,
            bookId: payload.bookId,
            status: payload.status ?? null,
            rating: payload.rating ?? null,
            copies: payload.copies ?? 1,
            book,
         });
      } else {
         if (payload.status !== undefined) {
            userBook.status = payload.status ?? null;
         }
         if (payload.rating !== undefined) {
            userBook.rating = payload.rating ?? null;
         }
         if (payload.copies !== undefined) {
            userBook.copies = payload.copies;
         }
      }

      await repo.save(userBook);
      return this.getUserBookByBookId(userId, payload.bookId);
   }

   static async updateUserBook(userId: number, bookId: number, payload: UserBookUpdateDTO) {
      const repo = AppDataSource.getRepository(UserBook);
      const userBook = await repo.findOne({ where: { userId, bookId } });
      if (!userBook) {
         return null;
      }

      if (payload.status !== undefined) {
         userBook.status = payload.status ?? null;
      }
      if (payload.rating !== undefined) {
         userBook.rating = payload.rating ?? null;
      }
      if (payload.copies !== undefined) {
         userBook.copies = payload.copies;
      }

      await repo.save(userBook);
      return this.getUserBookByBookId(userId, bookId);
   }

   static async setUserBookCopies(userId: number, bookId: number, copies: number) {
      return this.updateUserBook(userId, bookId, { copies });
   }
}
