import { Component, Input, signal } from '@angular/core';
import { Book } from '../../../../types/Book.model';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

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

   ngOnInit() {
      this.booksFiltered$.subscribe(() => {
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
