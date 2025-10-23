import { Component, signal } from '@angular/core';
import { Book } from '../../../../types/Book.model';
import { BookCard } from '../../components/book-card/book-card';
import { BooksService } from '../../../../services/booksService';

@Component({
   selector: 'app-deleted-books',
   imports: [BookCard],
   templateUrl: './deleted-books.html',
   styles: ''
})
export class DeletedBooks {
   deletedBooks = signal<Book[]>([]);

   constructor(private booksService: BooksService) {}

   ngOnInit(): void {
      this.booksService.getDeletedBooks()
         .subscribe(books => this.deletedBooks.set(books));
   }
}
