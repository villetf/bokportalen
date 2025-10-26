import { Component, effect, Input, signal, WritableSignal } from '@angular/core';
import { CdkMenuModule } from '@angular/cdk/menu';
import { Book } from '../../../../types/Book.model';
import { BehaviorSubject } from 'rxjs';
import { Filter } from '../../../../types/Filter.model';


@Component({
   selector: 'app-filter-list',
   standalone: true,
   imports: [CdkMenuModule],
   templateUrl: './filter-list.html',
   styles: ''
})

export class FilterList {
   @Input() booksOriginal$!: BehaviorSubject<Book[]>;
   @Input() booksFiltered!: WritableSignal<Book[]>;

   filterBy = signal<Filter[]>([
      // {
      //    bookProperty: 'format',
      //    filterString: 'Pocket',
      //    displayString: 'format'
      // },
      // {
      //    bookProperty: 'yearWritten',
      //    filterString: '2025',
      //    displayString: 'utgivningsår'
      // }
   ]);
   filterAlts = signal<string>('');

   constructor() {
      effect(() => {
         this.filterBooks();
      })
   }

   ngOnInit() {
      this.booksOriginal$
         .subscribe(() => {
            this.filterBooks();
         });
   }

   filterBooks() {
      let allBooks = [...this.booksOriginal$.value];

      this.filterBy().forEach((filter) => {
         allBooks = allBooks.filter((b) => b[filter.bookProperty] == filter.filterString);
      });

      this.booksFiltered.set([...allBooks]);
   }

   setFilter(filter: keyof Book, filterString: string | null, displayString: string) {
      if (filterString == '(Ej angivet)') {
         filterString = null;
      }
      const filterObject = this.constructFilterObject(filter, filterString, displayString);

      if (this.filterIsApplied(filterObject)) {
         this.filterBy.set(this.filterBy().filter(f => f.bookProperty !== filterObject.bookProperty && f.filterString !== filterObject.filterString));
         this.filterAlts.set('');
         return;
      }


      this.filterBy.set([...this.filterBy(), filterObject]);
      this.filterAlts.set('');
   }

   getChoosableFilterOptions(filterProperty: keyof Book) {
      const uniqueValues = new Set<string>();

      this.booksOriginal$.value.forEach(book => {
         const value = book[filterProperty];
         if (value !== undefined && value !== null) {
            uniqueValues.add(String(value));
         }
      });

      uniqueValues.add('(Ej angivet)');
      const uniqueArray = Array.from(uniqueValues);
      uniqueArray.sort();
      return uniqueArray;
   }

   filterIsApplied(filterObject: Filter) {
      return this.filterBy().some(filter => {
         return filter.bookProperty === filterObject.bookProperty &&
         filter.filterString === filterObject.filterString &&
         filter.displayString === filterObject.displayString;
      });
   }

   constructFilterObject(bookProperty: keyof Book, filterString: string | null, displayString: string) {
      const newObject: Filter = {
         bookProperty: bookProperty,
         filterString: filterString,
         displayString: displayString
      };

      return newObject;
   }
}
