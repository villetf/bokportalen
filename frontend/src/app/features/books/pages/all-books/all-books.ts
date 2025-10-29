import { Component, signal } from '@angular/core';
import { Book } from '../../../../types/Book.model';
import { BookCard } from '../../components/book-card/book-card';
import { BooksService } from '../../../../services/booksService';
import { BehaviorSubject } from 'rxjs';
import { CdkMenuModule } from '@angular/cdk/menu';
import { FilterList } from '../../components/filter-list/filter-list';
import { SearchBar } from '../../components/search-bar/search-bar';
import { AsyncPipe } from '@angular/common';
import { SortList } from '../../components/sort-list/sort-list';

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

   constructor(private booksService: BooksService) {
      this.booksSearched$.subscribe(() => {
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
}
