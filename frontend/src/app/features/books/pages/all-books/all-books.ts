import { Component, signal } from '@angular/core';
import { Book } from '../../../../types/Book.model';
import { BookCard } from "../../components/book-card/book-card";

@Component({
  selector: 'app-all-books',
  imports: [BookCard],
  templateUrl: './all-books.html',
  styles: ``
})
export class AllBooks {
   books = signal(<Book[]>[]);

   ngOnInit(): void {
      fetch('http://localhost:3000/books')
         .then(response => response.json())
         .then (data => data.map((book: Book) => {
            if (!book.coverLink) {
               book.coverLink = 'book-cover-placeholder.png';
            }
            return book;
         }))
         .then(data => this.books.set(data));
   }
}
