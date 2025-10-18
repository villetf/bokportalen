import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, switchMap } from 'rxjs';
import { BooksService } from '../../../../services/booksService';
import { Book } from '../../../../types/Book.model';
import { AsyncPipe, NgClass } from '@angular/common';
import { Button } from '../../../../shared/components/button/button';
import { BookCard } from '../../components/book-card/book-card';
import { EditPanel } from '../../../../shared/components/edit-panel/edit-panel';
import { EditBookForm } from '../../components/edit-book-form/edit-book-form';

@Component({
   selector: 'app-book-page',
   standalone: true,
   imports: [AsyncPipe, RouterLink, Button, BookCard, NgClass, EditPanel, EditBookForm],
   templateUrl: './book-page.html'
})
export class BookPage implements OnInit {
   book$ = new BehaviorSubject<Book | null>(null);
   booksByAuthor = signal<Book[]>([]);
   currentBook!: Book;
   editViewIsOpen = signal<boolean>(false);

   constructor(
      private route: ActivatedRoute,
      private booksService: BooksService
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


   ngOnInit(): void {
      this.route.params.pipe(
         // eslint-disable-next-line dot-notation
         switchMap(params => this.booksService.getBook(+params['id']))
      ).subscribe(book => {
         this.book$.next(book);
         this.currentBook = book;
         this.updateBooksByAuthor();
      });
   }
}
