import { BehaviorSubject, catchError, filter, map, of, tap, throwError } from 'rxjs';
import { Book } from '../types/Book.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AddBookDTO } from '../dtos/AddBookDTO';
import { Author } from '../types/Author.model';

@Injectable({ providedIn: 'root' })
export class BooksService {
   private books$ = new BehaviorSubject<Book[] | null>(null);

   constructor(private http: HttpClient) {}

   getBooks() {
      if (!this.books$.value) {
         return this.http.get<Book[]>('http://localhost:3000/books').pipe(
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

      return this.http.get<Book>(`http://localhost:3000/books/${id}`);
   }

   setBook(updatedBook: Book) {
      if (!this.books$.value) {
         return;
      }

      const currentBooks = this.books$.value!;
      const updatedBooks = currentBooks.map(book => book.id == updatedBook.id ? updatedBook : book);

      this.books$.next(updatedBooks);
   }

   getBooksByAuthor(authorId: number) {
      return this.getBooks().pipe(
         map(books => books.filter(b => b.authors.some(a => a.id === authorId)))
      );
   }

   editBook(book: Book) {
      return this.http.patch(`http://localhost:3000/books/${book.id}`, book);
   }

   addBook(book: AddBookDTO) {
      return this.http.post('http://localhost:3000/books/', book).pipe(
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
      return this.http.delete(`http://localhost:3000/books/${book.id}`);
   }
}