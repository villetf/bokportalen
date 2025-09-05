import { BehaviorSubject, Observable, of } from "rxjs";
import { Book } from "../types/Book.model";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class BooksService {
   private books$ = new BehaviorSubject<Book[] | null>(null);
   
   constructor(private http: HttpClient) {}

   getBooks() {
      if (!this.books$.value) {
         this.http.get<Book[]>('http://localhost:3000/books').subscribe(b => this.books$.next(b));
      }
      return this.books$.asObservable() as Observable<Book[]>;
   }

   getBook(id: number) {
      const existing = this.books$.value?.find(b => b.id === id);
      if (existing) {
         return of(existing);
      }

      return this.http.get<Book>(`http://localhost:3000/books/${id}`);
   }
}