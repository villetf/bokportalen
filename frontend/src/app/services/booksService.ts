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

   getBooksByAuthor(authorId: number) {
      return this.getBooks().pipe(
         tap(() => console.log('Fetching books by author:', authorId)),
         map(books => books.filter(b => b.author.some(a => a.id === authorId)))
      )
   }
}