import { CdkMenuModule } from '@angular/cdk/menu';
import { Component, effect, Input, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Book } from '../../../../types/Book.model';
import { BooksService } from '../../../../services/booksService';

@Component({
   selector: 'app-sort-list',
   imports: [CdkMenuModule],
   templateUrl: './sort-list.html',
   styles: ''
})
export class SortList {
   @Input() booksOriginal$!: BehaviorSubject<Book[]>;
   sortBy = signal<{ clearText: string, bookProperty: string }>({ clearText: 'Titel', bookProperty: 'title' });
   sortAscending = signal<boolean>(true);

   constructor(private booksService: BooksService) {
      effect(() => {
         this.sortBooks(this.sortBy().bookProperty);
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

}
