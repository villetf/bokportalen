import { CdkMenuModule } from '@angular/cdk/menu';
import { Component, DestroyRef, effect, inject, Input, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Book } from '../../../../types/Book.model';
import { BooksService } from '../../../../services/booksService';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

   private suppressEffect = false;
   private destroyRef = inject(DestroyRef);

   constructor(private booksService: BooksService, private route: ActivatedRoute, private router: Router) {
      this.route.queryParams
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(params => {
            const clearText = params['sortByClear'];
            const bookProperty = params['sortByProp'];
            if (clearText && bookProperty) {
               const current = this.sortBy();
               if (current.clearText !== clearText || current.bookProperty !== bookProperty) {
                  this.suppressEffect = true;
                  this.sortBy.set({ clearText, bookProperty });
                  queueMicrotask(() => this.suppressEffect = false);
               }
            }

            if (params['sortAsc'] !== undefined) {
               const sortAscProperty = this.stringToBoolean(params['sortAsc']);
               const current = this.sortAscending();
               if (current != sortAscProperty) {
                  this.suppressEffect = true;
                  this.sortAscending.set(sortAscProperty);
                  queueMicrotask(() => this.suppressEffect = false);
               }
            }
         });

      effect(() => {
         if (this.suppressEffect) {
            return;
         }
         this.sortBooks(this.sortBy().bookProperty);

         const { clearText, bookProperty } = this.sortBy();

         const queryParams = this.route.snapshot.queryParams;
         const sortByClear = queryParams['sortByClear'] ?? '';
         const sortByProp = queryParams['sortByProp'] ?? '';
         if (sortByClear !== clearText || sortByProp !== bookProperty) {
            this.router.navigate([], {
               relativeTo: this.route,
               queryParams: {
                  ...queryParams,
                  sortByClear: clearText,
                  sortByProp: bookProperty
               },
               queryParamsHandling: 'merge',
               replaceUrl: true
            });
         };

         const sortAsc = this.sortAscending();

         if (queryParams['sortAsc'] === undefined || this.stringToBoolean(queryParams['sortAsc']) !== sortAsc) {
            this.router.navigate([], {
               relativeTo: this.route,
               queryParams: {
                  ...this.route.snapshot.queryParams,
                  sortAsc: sortAsc
               },
               queryParamsHandling: 'merge',
               replaceUrl: true
            });
         }
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

   stringToBoolean(value: string): boolean {
      return value === 'true';
   }
}
