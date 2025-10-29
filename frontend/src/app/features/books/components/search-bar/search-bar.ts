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
      console.log('innan sub', this.booksFiltered$);
      this.booksFiltered$.subscribe(() => {
         console.log('booksfiltered', this.booksFiltered$.value);
         this.makeSearch(this.searchString());
      });
   }

   makeSearch(searchString: string) {
      console.log('söker...');
      const allBooks = this.booksFiltered$.value;
      if (searchString == '') {
         console.log('ingen söksträng', allBooks);
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

      console.log('searchres', searchResult);

      this.booksSearched$.next(searchResult);
   }
}
