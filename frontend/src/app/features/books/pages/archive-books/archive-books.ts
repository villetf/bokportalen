import { Component, inject } from '@angular/core';
import { AllBooks } from '../all-books/all-books';
import { BooksService } from '../../../../services/booksService';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
   selector: 'app-archive-books',
   standalone: true,
   imports: [AllBooks],
   templateUrl: './archive-books.html',
   styles: ''
})
export class ArchiveBooks {
   private booksService = inject(BooksService);
   private toast = inject(HotToastService);

   booksSource$ = this.booksService.getAllBooksWithShelfStatus();

   onAddBookToShelf(bookId: number) {
      this.booksService.addToShelf({ bookId, copies: 1 }).subscribe({
         next: () => {
            this.toast.success('Boken lades till i din bokhylla');
            // Refresh the book list to update inShelf status
            this.booksSource$ = this.booksService.getAllBooksWithShelfStatus();
         },
         error: (error) => {
            console.error('Error adding book to shelf:', error);
            this.toast.error('Det gick inte att lägga till boken');
         }
      });
   }
}
