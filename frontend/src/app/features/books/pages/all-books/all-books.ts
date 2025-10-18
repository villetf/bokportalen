import { Component } from '@angular/core';
import { Book } from '../../../../types/Book.model';
import { BookCard } from '../../components/book-card/book-card';
import { BooksService } from '../../../../services/booksService';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
   selector: 'app-all-books',
   imports: [BookCard, AsyncPipe],
   templateUrl: './all-books.html',
   styles: ''
})
export class AllBooks {
   books$!: Observable<Book[]>;

   constructor(private booksService: BooksService) {}

   ngOnInit(): void {
      this.books$ = this.booksService.getBooks();
   }
}
