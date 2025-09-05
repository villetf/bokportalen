import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { BooksService } from '../../../../services/booksService';
import { Book } from '../../../../types/Book.model';
import { AsyncPipe } from '@angular/common';
import { Button } from "../../../../shared/components/button/button";

@Component({
  selector: 'app-book-page',
  standalone: true,  
  imports: [AsyncPipe, RouterLink, Button],
  templateUrl: './book-page.html'
})
export class BookPage implements OnInit {
   book$!: Observable<Book>;

   constructor(
      private route: ActivatedRoute,
      private booksService: BooksService
   ) {}

   ngOnInit(): void {
      this.book$ = this.route.params.pipe(
         switchMap(params => this.booksService.getBook(+params['id']))
      );
   }
}
