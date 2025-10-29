import { Component, effect, signal } from '@angular/core';
import { Book } from '../../../../types/Book.model';
import { BookCard } from '../../components/book-card/book-card';
import { BooksService } from '../../../../services/booksService';
import { BehaviorSubject } from 'rxjs';
import { CdkMenuModule } from '@angular/cdk/menu';
import { FilterList } from '../../components/filter-list/filter-list';
import { SearchBar } from '../../components/search-bar/search-bar';
import { AsyncPipe } from '@angular/common';

@Component({
   selector: 'app-all-books',
   standalone: true,
   imports: [BookCard, CdkMenuModule, FilterList, SearchBar, AsyncPipe],
   templateUrl: './all-books.html',
   styles: ''
})
export class AllBooks {
   booksOriginal$ = new BehaviorSubject<Book[]>([]);
   booksFiltered$ = new BehaviorSubject<Book[]>([]);
   booksSearched$ = new BehaviorSubject<Book[]>([]);
   sortBy = signal<{ clearText: string, bookProperty: string }>({ clearText: 'Titel', bookProperty: 'title' });
   sortAscending = signal<boolean>(true);
   numberOfBooks = signal<number>(0);

   constructor(private booksService: BooksService) {
      effect(() => {
         this.sortBooks(this.sortBy().bookProperty);
      });

      this.booksSearched$.subscribe(() => {
         this.numberOfBooks.set(this.countBooks());
      });
   }

   ngOnInit(): void {
      this.booksService.getBooks().subscribe(books => {
         this.booksOriginal$.next(books);
         this.sortBooks(this.sortBy().bookProperty);
      });
   }

   sortBooks(by: string) {
      let preSorted = [...this.booksOriginal$.value];

      if (by == 'authors.0.lastName') {
         preSorted = preSorted.sort((a, b) => String(a.authors[0].firstName).localeCompare(String(b.authors[0].firstName), 'sv'));
      }

      if (by == 'authors.0.firstName') {
         preSorted = preSorted.sort((a, b) => String(a.authors[0].lastName).localeCompare(String(b.authors[0].lastName), 'sv'));
      }

      const sorted = preSorted.sort((a, b) => {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const getValue = (obj: any, path: string) => {
            return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? '';
         };

         const aValue = getValue(a, by);
         const bValue = getValue(b, by);

         if (!isNaN(aValue) && !isNaN(bValue)) {
            return Number(aValue) - Number(bValue);
         }

         return String(aValue).localeCompare(String(bValue), 'sv');
      });

      if (!this.sortAscending()) {
         sorted.reverse();
      }

      this.booksOriginal$.next(sorted);
   }

   setSortOrder(property: string, label: string) {
      this.sortBy.set({
         clearText: label,
         bookProperty: property
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
