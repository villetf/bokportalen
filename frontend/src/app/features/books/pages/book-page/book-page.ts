import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, switchMap } from 'rxjs';
import { BooksService } from '../../../../services/booksService';
import { Book } from '../../../../types/Book.model';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { Button } from '../../../../shared/components/button/button';
import { BookCard } from '../../components/book-card/book-card';
import { EditPanel } from '../../../../shared/components/edit-panel/edit-panel';
import { EditBookForm } from '../../components/edit-book-form/edit-book-form';
import { HotToastService } from '@ngxpert/hot-toast';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
   selector: 'app-book-page',
   standalone: true,
   imports: [AsyncPipe, RouterLink, Button, BookCard, NgClass, EditPanel, EditBookForm, DatePipe],
   templateUrl: './book-page.html'
})
export class BookPage implements OnInit {
   book$ = new BehaviorSubject<Book | null>(null);
   booksByAuthor = signal<Book[]>([]);
   currentBook!: Book;
   editViewIsOpen = signal<boolean>(false);

   private destroyRef = inject(DestroyRef);

   constructor(
      private route: ActivatedRoute,
      private booksService: BooksService,
      private toast: HotToastService
   ) {}


   getTitleClass(title: string) {
      if (title.length > 25) {
         return 'text-4xl';
      }

      return 'text-6xl';
   }

   openEditView = () => {
      this.editViewIsOpen.set(true);
   };

   closeEditView = () => {
      this.editViewIsOpen.set(false);
   };

   updateBook = (updatedBook: Book) => {
      this.book$.next(updatedBook);
      this.booksService.setBook(updatedBook);
      this.currentBook = updatedBook;
      this.updateBooksByAuthor();
   };

   updateBooksByAuthor = () => {
      this.booksByAuthor.set([]);
      this.currentBook.authors.forEach(author => {
         this.booksService.getBooksByAuthor(author.id).subscribe(books => {
            books.forEach(book => {
               this.booksByAuthor.set([...this.booksByAuthor(), book]);
            });
         });
      });
   };

   resetDeletedBook() {
      this.booksService.resetDeletedBook(this.currentBook)
         .pipe(
            this.toast.observe({
               loading: 'Återställer bok...',
               success: (res) => {
                  this.updateBook(res as Book);
                  return `Återställde ${(res as Book).title}!`;
               },
               error: (err) => {
                  return `Något gick fel vid återställning: ${(err as HttpErrorResponse).message}`;
               }
            })
         )
         .subscribe();
   }


   ngOnInit(): void {
      this.route.params
         .pipe(takeUntilDestroyed(this.destroyRef))
         .pipe(
            switchMap(params => this.booksService.getBook(+params['id']))
         )
         .subscribe(book => {
            this.book$.next(book);
            this.currentBook = book;
            this.updateBooksByAuthor();
         });
   }
}
