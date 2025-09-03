import { Component, Input } from '@angular/core';
import { Book } from '../../../../types/Book.model';

@Component({
  selector: 'app-book-card',
  imports: [],
  templateUrl: './book-card.html',
  styles: ``
})
export class BookCard {
   @Input()
   book!: Book;
}
