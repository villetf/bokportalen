import { BehaviorSubject, filter, map, Observable, of, tap } from "rxjs";
import { Book } from "../types/Book.model";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class BooksService {
   private books$ = new BehaviorSubject<Book[] | null>(null);
   
   constructor(private http: HttpClient) {}

   getBooks() {
      if (!this.books$.value) {
         return this.http.get<Book[]>('http://localhost:3000/books').pipe(
            tap(books => this.books$.next(books))
         );
      } else {
         return this.books$.asObservable().pipe(
            filter((books): books is Book[] => books != null)
         )
      }
   }

   getBook(id: number) {
      const existing = this.books$.value?.find(b => b.id === id);
      if (existing) {
         return of(existing);
      }

      return this.http.get<Book>(`http://localhost:3000/books/${id}`);
   }

   setBook(updatedBook: Book) {
      const currentBooks = this.books$.value!;
      const updatedBooks = currentBooks.map(book =>
         book.id === updatedBook.id ? updatedBook : book
      );

      this.books$.next(updatedBooks)
   }

   getBooksByAuthor(authorId: number) {
      return this.getBooks().pipe(
         map(books => books.filter(b => b.authors.some(a => a.id === authorId)))
      )
   }

   editBook(book: Book) {
      return this.http.patch(`http://localhost:3000/books/${book.id}`, book);
   }
}