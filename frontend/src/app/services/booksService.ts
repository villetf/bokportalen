import { BehaviorSubject, catchError, filter, map, of, tap, throwError } from 'rxjs';
import { Book } from '../types/Book.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AddBookDTO } from '../dtos/AddBookDTO';
import { Author } from '../types/Author.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BooksService {
   private books$ = new BehaviorSubject<Book[] | null>(null);
   private apiUrl = environment.apiUrl;

   constructor(private http: HttpClient) {}

   getBooks() {
      if (!this.books$.value) {
         return this.http.get<Book[]>(`${this.apiUrl}/books`).pipe(
            tap(books => this.books$.next(books))
         );
      }
      return this.books$.asObservable().pipe(
         filter((books): books is Book[] => books != null),
         map((books) => books.filter(book => !book.isDeleted))
      );
   }

   getBook(id: number) {
      const existing = this.books$.value?.find(b => b.id === id);
      if (existing) {
         return of(existing);
      }

      return this.http.get<Book>(`${this.apiUrl}/books/${id}`);
   }

   setBook(updatedBook: Book) {
      if (!this.books$.value) {
         return;
      }

      let updatedBooks;
      const currentBooks = this.books$.value!;
      if (currentBooks.some(b => b.id == updatedBook.id)) {
         updatedBooks = currentBooks.map(book => book.id == updatedBook.id ? updatedBook : book);
      } else {
         updatedBooks = [ ...currentBooks, updatedBook ];
      }

      this.books$.next(updatedBooks);
   }

   getBooksByAuthor(authorId: number) {
      return this.getBooks().pipe(
         map(books => books.filter(b => b.authors.some(a => a.id === authorId)))
      );
   }

   editBook(book: Book) {
      return this.http.patch(`${this.apiUrl}/books/${book.id}`, book);
   }

   addBook(book: AddBookDTO) {
      return this.http.post(`${this.apiUrl}/books/`, book).pipe(
         catchError(err => {
            console.error('Error when posting book:', err);
            return throwError(() => err);
         })
      );
   }

   updateAuthorInBooks(updatedAuthor: Author) {
      const currentBooks = this.books$.value;
      if (!currentBooks) {
         return;
      }

      const updatedBooks = currentBooks.map(book => ({
         ...book,
         authors: book.authors.map(author => author.id === updatedAuthor.id ? updatedAuthor : author)
      }));

      this.books$.next(updatedBooks);
   }

   deleteBook(book: Book) {
      return this.http.delete(`${this.apiUrl}/books/${book.id}`);
   }

   getDeletedBooks() {
      return this.http.get<Book[]>(`${this.apiUrl}/books/deleted`);
   }

   resetDeletedBook(book: Book) {
      return this.http.patch<Book>(`${this.apiUrl}/books/${book.id}`, {
         isDeleted: false
      });
   }
}