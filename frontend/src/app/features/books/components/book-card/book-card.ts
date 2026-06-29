import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Book } from '../../../../types/Book.model';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';


@Component({
   selector: 'app-book-card',
   imports: [RouterLink, NgClass],
   templateUrl: './book-card.html',
   styles: ''
})
export class BookCard {
   @Input()
      book!: Book;

   @Input()
      showRealCovers!: boolean;

   @Input()
      inShelf?: boolean;

   @Output()
      addToShelf = new EventEmitter<number>();
}
