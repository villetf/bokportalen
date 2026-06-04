import { Component, DestroyRef, HostListener, ViewChild, ElementRef, inject, signal, computed, Input, Output, EventEmitter } from '@angular/core';
import { UserBook } from '../../../../types/UserBook.model';
import { Book } from '../../../../types/Book.model';
import { BookCard } from '../../components/book-card/book-card';
import { BooksService } from '../../../../services/booksService';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { CdkMenuModule } from '@angular/cdk/menu';
import { FilterList } from '../../components/filter-list/filter-list';
import { SearchBar } from '../../components/search-bar/search-bar';
import { AsyncPipe } from '@angular/common';
import { SortList } from '../../components/sort-list/sort-list';
import { Router, NavigationStart } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserStore } from '../../../../stores/user.store';

@Component({
   selector: 'app-all-books',
   standalone: true,
   imports: [BookCard, CdkMenuModule, FilterList, SearchBar, AsyncPipe, SortList],
   templateUrl: './all-books.html',
   styles: ''
})
export class AllBooks {
   private booksSourceSubscription?: Subscription;
   private booksSourceInternal$?: Observable<(UserBook | Book)[]>;

   @Input()
   set booksSource$(value: Observable<(UserBook | Book)[]> | undefined) {
      this.booksSourceInternal$ = value;
      this.bindBooksSource();
   }

   get booksSource$() {
      return this.booksSourceInternal$;
   }

   @Input() mode: 'shelf' | 'archive' = 'shelf';
   @Input() title: string = 'BOKSAMLING';
   @Output() addBookToShelf = new EventEmitter<number>();

   private readonly scrollStorageKey = 'all-books-scrollTop';
   private hasRestoredScroll = false;
   @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLElement>;
   booksOriginal$ = new BehaviorSubject<(UserBook | Book)[]>([]);
   booksFiltered$ = new BehaviorSubject<(UserBook | Book)[]>([]);
   booksSearched$ = new BehaviorSubject<(UserBook | Book)[]>([]);
   numberOfBooks = signal<number>(0);

   private destroyRef = inject(DestroyRef);
   private userStore = inject(UserStore);
   protected user = computed(() => this.userStore.user());

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

   ngOnInit() {
      this.bindBooksSource();
   }

   ngOnDestroy() {
      this.booksSourceSubscription?.unsubscribe();
   }

   private bindBooksSource() {
      const source = this.booksSourceInternal$ ?? this.booksService.getShelfBooks();
      this.booksSourceSubscription?.unsubscribe();
      this.booksSourceSubscription = source.subscribe(books => {
         this.booksOriginal$.next([...books]);
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
      if (this.mode === 'archive') {
         return currentBooks.length;
      }

      let numberOfBooks = 0;
      currentBooks.forEach(book => {
         if ('copies' in book && book.copies) {
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

   onAddBookToShelf(bookId: number) {
      this.addBookToShelf.emit(bookId);
   }
}
