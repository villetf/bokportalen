import { Component, Input } from '@angular/core';
import { Button } from '../../../../shared/components/button/button';
import { BooksService } from '../../../../services/booksService';
import { Book } from '../../../../types/Book.model';
import { HotToastService } from '@ngxpert/hot-toast';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
   selector: 'app-delete-confirmation',
   imports: [Button],
   templateUrl: './delete-confirmation.html',
   styles: ''
})
export class DeleteConfirmation {
   @Input()
      closePanel!: () => void;
   @Input()
      currentBook!: Book;

   constructor(
      private booksService: BooksService,
      private toast: HotToastService,
      private router: Router
   ) {}

   deleteBook() {
      this.booksService.deleteBook(this.currentBook)
         .pipe(
            this.toast.observe({
               loading: 'Raderar bok...',
               success: () => {
                  this.currentBook.isDeleted = true;
                  this.booksService.setBook(this.currentBook);
                  this.router.navigate(['/books']);
                  return `${this.currentBook.title} raderades!`;
               },
               error: (err) => {
                  return `Något gick fel vid skapande av författare: ${(err as HttpErrorResponse).message}`;
               }
            })
         )
         .subscribe();
   }
}
