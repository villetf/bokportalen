import { Component, DestroyRef, HostListener, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { Book } from '../../../../types/Book.model';
import { BookCard } from '../../components/book-card/book-card';
import { BooksService } from '../../../../services/booksService';
import { BehaviorSubject } from 'rxjs';
import { CdkMenuModule } from '@angular/cdk/menu';
import { FilterList } from '../../components/filter-list/filter-list';
import { SearchBar } from '../../components/search-bar/search-bar';
import { AsyncPipe } from '@angular/common';
import { SortList } from '../../components/sort-list/sort-list';
import { Router, NavigationStart } from '@angular/router';
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
   private readonly scrollStorageKey = 'all-books-scrollTop';
   private hasRestoredScroll = false;
   @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLElement>;
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

      this.router.events
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(event => {
            if (event instanceof NavigationStart) {
               this.saveScrollPosition();
            }
         });
   }

   ngAfterViewInit() {
      this.restoreScrollPosition();
   }

   @HostListener('window:beforeunload')
   handleBeforeUnload() {
      this.saveScrollPosition();
   }

   private saveScrollPosition() {
      try {
         const el = this.scrollContainer?.nativeElement;
         if (el) {
            sessionStorage.setItem(this.scrollStorageKey, String(Math.max(0, Math.floor(el.scrollTop || 0))));
         }
      } catch {
         // Ignore storage errors (e.g., Safari private mode)
      }
   }

   private restoreScrollPosition() {
      if (this.hasRestoredScroll) {
         return;
      }
      try {
         const saved = sessionStorage.getItem(this.scrollStorageKey);
         const el = this.scrollContainer?.nativeElement;
         if (saved && el) {
            const y = parseInt(saved, 10);
            if (!Number.isNaN(y) && y >= 0) {
               requestAnimationFrame(() => {
                  el.scrollTop = y;
               });
            }
            this.hasRestoredScroll = true;
            sessionStorage.removeItem(this.scrollStorageKey);
         }
      } catch {
         // Ignore storage errors
      }
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
      this.saveScrollPosition();
      this.router.navigate([`/books/${randomBookId}`]);
   }
}
