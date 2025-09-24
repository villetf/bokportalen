import { Component, OnInit, Signal, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { BooksService } from '../../../../services/booksService';
import { Book } from '../../../../types/Book.model';
import { AsyncPipe, KeyValuePipe, NgClass } from '@angular/common';
import { Button } from "../../../../shared/components/button/button";
import { BookCard } from "../../components/book-card/book-card";
import { EditPanel } from "../../../../shared/components/edit-panel/edit-panel";
import { ArrayInput } from "../../../../shared/components/array-input/array-input";
import { Author } from '../../../../types/Author.model';
import { AuthorsService } from '../../../../services/authorsService';

@Component({
  selector: 'app-book-page',
  standalone: true,  
  imports: [AsyncPipe, RouterLink, Button, BookCard, NgClass, EditPanel, KeyValuePipe, ArrayInput],
  templateUrl: './book-page.html'
})
export class BookPage implements OnInit {
   book$!: Observable<Book>;
   booksByAuthor = signal<Book[]>([]);
   currentBook!: Book;
   editViewIsOpen = signal<boolean>(false);
   allAuthors: Author[] = [];

   constructor(
      private route: ActivatedRoute,
      private booksService: BooksService,
      private authorsService: AuthorsService
   ) {}

   
   getTitleClass(title: string) {
      if (title.length > 25) {
         return 'text-4xl';
      }

      return 'text-6xl';
   }

   openEditView = () => {
      console.log('open edit view', this);
      this.editViewIsOpen.set(true);
   }

   closeEditView = () => {
      console.log('stänger vyn');
      this.editViewIsOpen.set(false);
   }

   displayAuthor = (author: Author) => `${author.firstName} ${author.lastName}`;

   ngOnInit(): void {
      this.book$ = this.route.params.pipe(
         switchMap(params => this.booksService.getBook(+params['id']))
      );

      this.book$.subscribe(value => {
         this.booksByAuthor.set([]);
         this.currentBook = value
         this.currentBook.author.forEach(author => {
            const books = this.booksService.getBooksByAuthor(author.id);

            books.subscribe(value => {
               value.forEach(book => {
                  this.booksByAuthor.set([...this.booksByAuthor(), book])
               });
            })
         })
      })

      this.authorsService.getAllAuthors().then(authors => {
         this.allAuthors = authors;
      });
   }
}
