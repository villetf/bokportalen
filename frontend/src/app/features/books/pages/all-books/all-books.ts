import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Book } from '../../../../types/Book.model';
import { BookCard } from '../../components/book-card/book-card';
import { BooksService } from '../../../../services/booksService';
import { BehaviorSubject } from 'rxjs';
import { CdkMenuModule } from '@angular/cdk/menu';
import { FilterList } from '../../components/filter-list/filter-list';
import { SearchBar } from '../../components/search-bar/search-bar';
import { AsyncPipe } from '@angular/common';
import { SortList } from '../../components/sort-list/sort-list';
import { Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
   selector: 'app-all-books',
   standalone: true,
   imports: [BookCard, CdkMenuModule, FilterList, SearchBar, AsyncPipe, SortList],
   templateUrl: './all-books.html',
   styles: ''
})
export class AllBooks {
   booksOriginal$ = new BehaviorSubject<Book[]>([]);
   booksFiltered$ = new BehaviorSubject<Book[]>([]);
   booksSearched$ = new BehaviorSubject<Book[]>([]);
   numberOfBooks = signal<number>(0);

   private destroyRef = inject(DestroyRef);

   constructor(private booksService: BooksService, private router: Router, private toast: HotToastService) {
      this.booksSearched$
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(() => {
            this.numberOfBooks.set(this.countBooks());
         });
   }

   countBooks() {
      const currentBooks = this.booksSearched$.value;
      let numberOfBooks = 0;
      currentBooks.forEach(book => {
         if (book.copies) {
            numberOfBooks += book.copies;
         }
      });

      return numberOfBooks;
   }

   getRandomBook() {
      const currentBooks = this.booksSearched$.value;
      if (!currentBooks.length) {
         this.toast.error('Välj några böcker att slumpa från.');
         return;
      }
      const randomNumber = Math.floor(Math.random() * (currentBooks.length));
      const randomBookId = currentBooks[randomNumber].id;
      this.router.navigate([`/books/${randomBookId}`]);
   }
}
