import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { BooksService } from '../../../../services/booksService';
import { Book } from '../../../../types/Book.model';
import { AsyncPipe, NgClass } from '@angular/common';
import { Button } from "../../../../shared/components/button/button";
import { BookCard } from "../../components/book-card/book-card";

@Component({
  selector: 'app-book-page',
  standalone: true,  
  imports: [AsyncPipe, RouterLink, Button, BookCard, NgClass],
  templateUrl: './book-page.html'
})
export class BookPage implements OnInit {
   book$!: Observable<Book>;
   booksByAuthor = signal<Book[]>([]);
   currentBook!: Book;

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
   }
}
