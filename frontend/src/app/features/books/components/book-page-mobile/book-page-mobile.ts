import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Book } from '../../../../types/Book.model';
import { UserBook } from '../../../../types/UserBook.model';
import { Button } from '../../../../shared/components/button/button';
import { ShelfDetailsForm } from '../shelf-details-form/shelf-details-form';

@Component({
   selector: 'app-book-page-mobile',
   standalone: true,
   imports: [DatePipe, RouterLink, Button, ShelfDetailsForm],
   templateUrl: './book-page-mobile.html'
})
export class BookPageMobile {
   @Input({ required: true }) book!: Book;
   @Input() shelfBook: UserBook | null = null;
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
}
