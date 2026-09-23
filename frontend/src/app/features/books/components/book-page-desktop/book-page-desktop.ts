import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Book } from '../../../../types/Book.model';
import { UserBook } from '../../../../types/UserBook.model';
import { Button } from '../../../../shared/components/button/button';
import { BookCard } from '../book-card/book-card';
import { ShelfDetailsForm } from '../shelf-details-form/shelf-details-form';

@Component({
   selector: 'app-book-page-desktop',
   standalone: true,
   imports: [DatePipe, NgClass, RouterLink, Button, BookCard, ShelfDetailsForm],
   templateUrl: './book-page-desktop.html'
})
export class BookPageDesktop {
   @Input({ required: true }) book!: Book;
   @Input() shelfBook: UserBook | null = null;
   @Input() booksByAuthor: UserBook[] = [];
   @Input() shelfStatus: string | null = null;
   @Input() shelfRating: number | null = null;
   @Input() shelfCopies = 1;

   @Output() editRequested = new EventEmitter<void>();
   @Output() resetRequested = new EventEmitter<void>();
   @Output() shelfStatusChange = new EventEmitter<string | null>();
   @Output() shelfRatingChange = new EventEmitter<number | null>();
   @Output() shelfCopiesChange = new EventEmitter<number>();
   @Output() saveShelfRequested = new EventEmitter<void>();
   @Output() removeShelfRequested = new EventEmitter<void>();

   getTitleClass(title: string) {
      return title.length > 25 ? 'text-4xl' : 'text-6xl';
   }
}
