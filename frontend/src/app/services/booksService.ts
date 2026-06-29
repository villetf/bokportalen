import { BehaviorSubject, catchError, combineLatest, filter, map, of, tap, throwError } from 'rxjs';
import { Book } from '../types/Book.model';
import { UserBook } from '../types/UserBook.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AddBookDTO } from '../dtos/AddBookDTO';
import { Author } from '../types/Author.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BooksService {
   private shelfBooks$ = new BehaviorSubject<UserBook[] | null>(null);
   private allBooks$ = new BehaviorSubject<Book[] | null>(null);
   private apiUrl = environment.apiUrl;

   constructor(private http: HttpClient) {}

   getShelfBooks(includeZeroCopies = false) {
      if (includeZeroCopies) {
         return this.http.get<UserBook[]>(`${this.apiUrl}/users/me/books?includeZeroCopies=true`);
      }

      if (!this.shelfBooks$.value) {
         return this.http.get<UserBook[]>(`${this.apiUrl}/users/me/books`).pipe(
            tap(books => this.shelfBooks$.next(books))
         );
      }
      return this.shelfBooks$.asObservable().pipe(
         filter((books): books is UserBook[] => books != null),
         map((books) => books.filter(book => !book.isDeleted && book.copies > 0))
      );
   }

   getShelfBook(id: number) {
      const existing = this.shelfBooks$.value?.find(b => b.id === id);
      if (existing) {
         return of(existing);
      }

      return this.http.get<UserBook>(`${this.apiUrl}/users/me/books/${id}`);
   }

   setShelfBook(updatedBook: UserBook) {
      if (!this.shelfBooks$.value) {
         return;
      }

      let updatedBooks;
      const currentBooks = this.shelfBooks$.value!;
      if (currentBooks.some(b => b.id == updatedBook.id)) {
         updatedBooks = currentBooks.map(book => book.id == updatedBook.id ? updatedBook : book);
      } else {
         updatedBooks = [ ...currentBooks, updatedBook ];
      }

      this.shelfBooks$.next(updatedBooks);
   }

   evictShelfBook(bookId: number) {
      if (!this.shelfBooks$.value) {
         return;
      }
      this.shelfBooks$.next(this.shelfBooks$.value.filter(book => book.id !== bookId));
   }

   getShelfBooksByAuthor(authorId: number) {
      return this.getShelfBooks().pipe(
         map(books => books.filter(b => b.authors.some(a => a.id === authorId)))
      );
   }

   addToShelf(payload: { bookId: number; status?: string | null; rating?: number | null; copies?: number }) {
      return this.http.post<UserBook>(`${this.apiUrl}/users/me/books`, payload).pipe(
         tap(book => this.setShelfBook(book))
      );
   }

   updateShelfBook(bookId: number, payload: { status?: string | null; rating?: number | null; copies?: number }) {
      return this.http.patch<UserBook>(`${this.apiUrl}/users/me/books/${bookId}`, payload).pipe(
         tap(book => this.setShelfBook(book))
      );
   }

   removeFromShelf(bookId: number) {
      return this.http.delete<UserBook>(`${this.apiUrl}/users/me/books/${bookId}`).pipe(
         tap(() => {
            if (!this.shelfBooks$.value) {
               return;
            }
            this.shelfBooks$.next(this.shelfBooks$.value.filter(book => book.id !== bookId));
         })
      );
   }

   getGlobalBook(id: number) {
      return this.http.get<Book>(`${this.apiUrl}/books/${id}`);
   }

   getAllBooks() {
      if (!this.allBooks$.value) {
         return this.http.get<Book[]>(`${this.apiUrl}/books`).pipe(
            tap(books => this.allBooks$.next(books))
         );
      }

      return this.allBooks$.asObservable().pipe(
         filter((books): books is Book[] => books != null)
      );
   }

   getAllBooksWithShelfStatus() {
      return combineLatest([
         this.getAllBooks(),
         this.getShelfBooks()
      ]).pipe(
         map(([allBooks, shelfBooks]) => {
            const shelfBookIds = new Set(shelfBooks.map((b: UserBook) => b.id));
            return allBooks.map(book => ({
               ...book,
               inShelf: shelfBookIds.has(book.id)
            }));
         })
      );
   }

   editBook(book: Book) {
      return this.http.patch<Book>(`${this.apiUrl}/books/${book.id}`, book).pipe(
         tap(() => this.allBooks$.next(null))
      );
   }

   addBook(book: AddBookDTO) {
      return this.http.post<Book>(`${this.apiUrl}/books/`, book).pipe(
         catchError(err => {
            console.error('Error when posting book:', err);
            return throwError(() => err);
         }),
         tap(() => this.allBooks$.next(null))
      );
   }

   updateAuthorInBooks(updatedAuthor: Author) {
      const currentBooks = this.shelfBooks$.value;
      if (!currentBooks) {
         return;
      }

      const updatedBooks = currentBooks.map(book => ({
         ...book,
         authors: book.authors.map(author => author.id === updatedAuthor.id ? updatedAuthor : author)
      }));

      this.shelfBooks$.next(updatedBooks);
   }

   deleteBook(book: Book) {
      return this.http.delete(`${this.apiUrl}/books/${book.id}`).pipe(
         tap(() => this.allBooks$.next(null))
      );
   }

   getDeletedBooks() {
      return this.http.get<Book[]>(`${this.apiUrl}/books/deleted`);
   }

   resetDeletedBook(book: Book) {
      return this.http.patch<Book>(`${this.apiUrl}/books/${book.id}`, {
         isDeleted: false
      }).pipe(
         tap(() => this.allBooks$.next(null))
      );
   }
}