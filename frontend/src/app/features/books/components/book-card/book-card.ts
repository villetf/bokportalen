import { Component, Input } from '@angular/core';
import { Book } from '../../../../types/Book.model';
import { RouterLink } from '@angular/router';


@Component({
   selector: 'app-book-card',
   imports: [RouterLink],
   templateUrl: './book-card.html',
   styles: ''
})
export class BookCard {
   @Input()
      book!: Book;
}
