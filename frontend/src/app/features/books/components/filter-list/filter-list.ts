import { Component, effect, Input, signal } from '@angular/core';
import { CdkMenuModule } from '@angular/cdk/menu';
import { Book } from '../../../../types/Book.model';
import { Genre } from '../../../../types/Genre.model';
import { BehaviorSubject } from 'rxjs';
import { Filter } from '../../../../types/Filter.model';
import { Language } from '../../../../types/Language.model';
import { KeyValuePipe } from '@angular/common';


@Component({
   selector: 'app-filter-list',
   standalone: true,
   imports: [CdkMenuModule, KeyValuePipe],
   templateUrl: './filter-list.html',
   styles: ''
})

export class FilterList {
   @Input() booksOriginal$!: BehaviorSubject<Book[]>;
   @Input() booksFiltered$!: BehaviorSubject<Book[]>;

   // Den lista av filter som ska appliceras på böckerna
   filterBy = signal<Filter[]>([]);

   // Den bok-egenskap som är vald i filtreringslistan
   filterAlts = signal<{key: string, label: string}>({key: '', label: ''});

   // Det som är möjligt att filtrera på
   filterOptions = [
      { key: 'format' as keyof Book, label: 'Format' },
      { key: 'language' as keyof Book, label: 'Språk' },
      { key: 'originalLanguage' as keyof Book, label: 'Originalspråk' },
      { key: 'yearWritten' as keyof Book, label: 'Publiceringsår' },
      { key: 'genre' as keyof Book, label: 'Genre' },
      { key: 'status' as keyof Book, label: 'Status' },
      { key: 'authors' as keyof Book, label: 'Författare' },
   ];

   constructor() {
      // Gör en ny filtrering då filterBy har ändrats
      effect(() => {
         this.filterBooks();
      });
   }

   ngOnInit() {
      this.booksOriginal$
         .subscribe(() => {
            this.filterBooks();
         });
   }

   // Gör filteringen och sätter i filteredBooks
   filterBooks() {
      const originalBooks = this.booksOriginal$.value;
      const filters = this.filterBy();

      if (!filters.length) {
         this.booksFiltered$.next(originalBooks);
         return;
      }

      const groupedFilters = this.groupFilters(filters);

      // Filtrera böckerna
      const filteredBooks = originalBooks.filter(book => {
         return Object.entries(groupedFilters).every(([property, allowedValues]) => {
            if (property == 'language' || property == 'originalLanguage' || property == 'genre') {
               if (!book[property]) {
                  return allowedValues.includes(book[property as keyof Book] as string | null);
               }

               return allowedValues.includes((book[property as keyof Book] as Language | Genre).name as string | null);
            }

            if (property == 'yearPublished') {
               return allowedValues.includes(String(book[property as keyof Book]));
            }

            if (property == 'authorName') {
               return book.authors.some(author => allowedValues.includes(`${author.firstName} ${author.lastName}`));
            }

            if (property == 'authorGender') {
               return book.authors.some(author => allowedValues.includes(author.gender));
            }

            if (property == 'authorCountry') {
               return book.authors.some(author => {
                  if (author.country) {
                     return allowedValues.includes(author.country.name);
                  }

                  return false;
               });
            }

            return allowedValues.includes(String(book[property as keyof Book] as string | null));
         }
         );
      }
      );

      this.booksFiltered$.next(filteredBooks);
   }

   // Sätter valt filter till filterBy
   setFilter(filter: keyof Book, filterString: string | null, displayString: string) {
      if (filterString == '(Ej angivet)') {
         filterString = null;
      }
      const filterObject = this.constructFilterObject(filter, filterString, displayString);

      // Kollar ifall filtret redan är applicerat, tar isåfall bort det
      if (this.filterIsApplied(filterObject)) {
         this.filterBy.set(this.filterBy().filter(f => f.bookProperty !== filterObject.bookProperty || f.filterString !== filterObject.filterString));
         return;
      }

      this.filterBy.set([...this.filterBy(), filterObject]);
   }

   // Hämta de filteralternativ som finns på vald egenskap
   getChoosableFilterOptions(filterProperty: string) {
      const uniqueValues = new Set<string>();

      this.booksOriginal$.value.forEach(book => {
         let value;

         // Specialfall för språk, originalspråk och genre
         if (filterProperty == 'language' || filterProperty == 'originalLanguage' || filterProperty == 'genre') {
            if (!book[filterProperty]) {
               return;
            }
            value = book[filterProperty].name;
         } else {
            value = book[(filterProperty as keyof Book)];
         }

         // Specialfall för författarnamn
         if (filterProperty == 'authorName') {
            for (const author of book.authors) {
               uniqueValues.add(String(`${author.firstName} ${author.lastName}`));
            }
            return;
         }

         // Specialfall för författarkön
         if (filterProperty == 'authorGender') {
            for (const author of book.authors) {
               if (author.gender != null) {
                  uniqueValues.add(String(author.gender));
               }
            }
            return;
         }

         // Specialfall för författarland
         if (filterProperty == 'authorCountry') {
            for (const author of book.authors) {
               if (author.country) {
                  uniqueValues.add(String(author.country.name));
               }
            }
            return;
         }

         if (value !== undefined && value !== null) {
            uniqueValues.add(String(value));
         }
      });

      uniqueValues.add('(Ej angivet)');
      const uniqueArray = Array.from(uniqueValues);
      uniqueArray.sort((a, b) => {
         const aNum = !isNaN(Number(a));
         const bNum = !isNaN(Number(b));

         if (aNum && bNum) {
            // Om båda är siffror, jämför numeriskt
            return Number(a) - Number(b);
         } else if (aNum) {
            return 1;
         } else if (bNum) {
            return -1;
         }
         // Annars alfabetiskt
         return a.localeCompare(b, 'sv');
      }
      );
      return uniqueArray;
   }

   // Kollar om ett filter finns i filterlistan
   filterIsApplied(filterObject: Filter) {
      if (filterObject.filterString == '(Ej angivet)') {
         filterObject.filterString = null;
      }

      return this.filterBy().some(filter => {
         return filter.bookProperty === filterObject.bookProperty &&
         filter.filterString === filterObject.filterString &&
         filter.displayString === filterObject.displayString;
      });
   }

   // Skapar ett Filter-objekt av inskickade argument
   constructFilterObject(bookProperty: keyof Book, filterString: string | null, displayString: string) {
      const newObject: Filter = {
         bookProperty: bookProperty,
         filterString: filterString,
         displayString: displayString
      };

      return newObject;
   }

   // Konverterar en string till en keyof Book
   stringToKeyof(inputString: string): keyof Book {
      return inputString as keyof Book;
   }

   // Grupperar filter efter sin kolumn och returnerar som ett objekt av key (kolumnen) och values (array av filter för kolumnen)
   groupFilters(filters: Filter[]) {
      return filters.reduce((groups, filter) => {
         if (!groups[filter.bookProperty]) {
            groups[filter.bookProperty] = [];
         }
         groups[filter.bookProperty].push(filter.filterString);
         return groups;
      }, {} as Record<string, (string | null)[]>);
   }

   // Hittar rätt label för en nyckel
   convertKeyToLabel(key: string) {
      switch (key) {
      case 'authorName':
         return 'Författarnamn';
      case 'authorGender':
         return 'Författarkön';
      case 'authorCountry':
         return 'Författarland';
      default:
         break;
      }
      return this.filterOptions.find(f => f.key == key)?.label;
   }
}
