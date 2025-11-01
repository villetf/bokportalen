import { Component, DestroyRef, effect, inject, Input, signal } from '@angular/core';
import { Book } from '../../../../types/Book.model';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
   selector: 'app-search-bar',
   imports: [FormsModule],
   templateUrl: './search-bar.html',
   styles: ''
})
export class SearchBar {
   @Input() booksSearched$!: BehaviorSubject<Book[]>;
   @Input() booksFiltered$!: BehaviorSubject<Book[]>;

   searchString = signal<string>('');
   private suppressEffect = false;
   private destroyRef = inject(DestroyRef);

   constructor(private route: ActivatedRoute, private router: Router) {
      this.route.queryParams
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(params => {
            const searchStringParam = params['searchString'];
            if (searchStringParam) {
               const currentSearch = this.searchString();

               if (currentSearch !== searchStringParam) {
                  this.suppressEffect = true;
                  this.searchString.set(searchStringParam);
                  queueMicrotask(() => this.suppressEffect = false);
               }
            }
         });

      effect(() => {
         if (this.suppressEffect) {
            return;
         }
         const searchString = this.searchString();

         const queryParams = this.route.snapshot.queryParams;
         if (queryParams['searchString'] !== searchString) {
            this.router.navigate([], {
               relativeTo: this.route,
               queryParams: {
                  ...queryParams,
                  searchString: searchString || null
               },
               queryParamsHandling: 'merge',
               replaceUrl: true
            });
         };
      });

   }

   ngOnInit() {
      this.booksFiltered$
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(() => {
            this.makeSearch(this.searchString());
         });
   }

   makeSearch(searchString: string) {
      const allBooks = this.booksFiltered$.value;
      if (searchString == '') {
         this.booksSearched$.next(allBooks);
         return;
      }

      const searchLower = searchString.toLowerCase();

      const searchResult = allBooks.filter((b) => {
         const titleMatch = b.title.toLowerCase().includes(searchLower);
         const authorMatch = b.authors.some(a => `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchLower)
         );
         return titleMatch || authorMatch;
      });

      this.booksSearched$.next(searchResult);
   }
}
