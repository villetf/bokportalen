import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, of, switchMap } from 'rxjs';
import { BooksService } from '../../../../services/booksService';
import { Book } from '../../../../types/Book.model';
import { UserBook } from '../../../../types/UserBook.model';
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
   shelfBook$ = new BehaviorSubject<UserBook | null>(null);
   booksByAuthor = signal<UserBook[]>([]);
   currentBook!: Book;
   currentShelfBook: UserBook | null = null;
   editViewIsOpen = signal<boolean>(false);
   shelfStatus = signal<string | null>(null);
   shelfRating = signal<number | null>(null);
   shelfCopies = signal<number>(1);

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
      if (this.currentShelfBook) {
         this.booksService.setShelfBook({
            ...this.currentShelfBook,
            ...updatedBook,
         } as UserBook);
      }
      this.currentBook = updatedBook;
      this.updateBooksByAuthor();
   };

   updateBooksByAuthor = () => {
      const seenIds = new Set<number>();
      const aggregated: UserBook[] = [];
      this.booksByAuthor.set([]);
      this.currentBook.authors.forEach(author => {
         this.booksService.getShelfBooksByAuthor(author.id).subscribe(books => {
            books.forEach(book => {
               if (book.id !== this.currentBook.id && !seenIds.has(book.id)) {
                  seenIds.add(book.id);
                  aggregated.push(book);
               }
            });
            this.booksByAuthor.set([...aggregated]);
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


   loadShelfBook(bookId: number) {
      this.booksService.getShelfBook(bookId)
         .pipe(
            takeUntilDestroyed(this.destroyRef),
            catchError(() => of(null))
         )
         .subscribe(userBook => {
            this.shelfBook$.next(userBook);
            this.currentShelfBook = userBook;
            this.shelfStatus.set(userBook?.status ?? null);
            this.shelfRating.set(userBook?.rating ?? null);
            this.shelfCopies.set(userBook?.copies ?? 1);
         });
   }

   saveShelfChanges() {
      if (!this.currentBook) {
         return;
      }

      const payload = {
         status: this.shelfStatus(),
         rating: this.shelfRating(),
         copies: this.shelfCopies(),
      };

      const request$ = this.currentShelfBook
         ? this.booksService.updateShelfBook(this.currentBook.id, payload)
         : this.booksService.addToShelf({ bookId: this.currentBook.id, ...payload });

      request$
         .pipe(
            this.toast.observe({
               loading: 'Uppdaterar bokhylla...',
               success: (res) => {
                  const updated = res as UserBook;
                  this.shelfBook$.next(updated);
                  this.currentShelfBook = updated;
                  this.shelfStatus.set(updated.status ?? null);
                  this.shelfRating.set(updated.rating ?? null);
                  this.shelfCopies.set(updated.copies ?? 1);
                  return `Uppdaterade ${(updated as UserBook).title} i bokhyllan!`;
               },
               error: (err) => `Något gick fel vid uppdatering: ${(err as HttpErrorResponse).message}`
            })
         )
         .subscribe();
   }

   removeFromShelf() {
      if (!this.currentBook) {
         return;
      }

      this.booksService.removeFromShelf(this.currentBook.id)
         .pipe(
            this.toast.observe({
               loading: 'Tar bort från bokhyllan...',
               success: () => {
                  this.shelfBook$.next(null);
                  this.currentShelfBook = null;
                  this.shelfCopies.set(0);
                  return 'Tog bort från bokhyllan.';
               },
               error: (err) => `Något gick fel vid borttagning: ${(err as HttpErrorResponse).message}`
            })
         )
         .subscribe();
   }

   ngOnInit(): void {
      this.route.params
         .pipe(takeUntilDestroyed(this.destroyRef))
         .pipe(
            switchMap(params => this.booksService.getGlobalBook(+params['id']))
         )
         .subscribe(book => {
            this.book$.next(book);
            this.currentBook = book;
            this.updateBooksByAuthor();
            this.loadShelfBook(book.id);
         });
   }
}
