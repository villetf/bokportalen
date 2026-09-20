import { Component, DestroyRef, HostListener, ViewChild, ElementRef, inject, signal, computed, Input, Output, EventEmitter } from '@angular/core';
import { UserBook } from '../../../../types/UserBook.model';
import { Book } from '../../../../types/Book.model';
import { BookCard } from '../../components/book-card/book-card';
import { BooksService } from '../../../../services/booksService';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { CdkMenuModule } from '@angular/cdk/menu';
import { FilterList } from '../../components/filter-list/filter-list';
import { SearchBar } from '../../components/search-bar/search-bar';
import { AsyncPipe, NgClass } from '@angular/common';
import { SortList } from '../../components/sort-list/sort-list';
import { Router, NavigationStart } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserStore } from '../../../../stores/user.store';

@Component({
   selector: 'app-all-books',
   standalone: true,
   imports: [BookCard, CdkMenuModule, FilterList, SearchBar, AsyncPipe, NgClass, SortList],
   templateUrl: './all-books.html'
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
   @Input() title: string = 'MIN BOKHYLLA';
   @Output() addBookToShelf = new EventEmitter<number>();

   private readonly scrollStorageKey = 'all-books-scrollTop';
   private readonly titleCollapseDistance = 90;
   private readonly controlsCollapseDistance = 120;
   private hasRestoredScroll = false;
   private lastScrollTop = 0;
   private lastScrollDirection: 'up' | 'down' = 'down';
   private useNaturalToolbarScroll = true;
   private scrollEndTimer?: ReturnType<typeof setTimeout>;
   private toolbarResizeObserver?: ResizeObserver;
   @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLElement>;
   @ViewChild('toolbar') private toolbar?: ElementRef<HTMLElement>;
   booksOriginal$ = new BehaviorSubject<(UserBook | Book)[]>([]);
   booksFiltered$ = new BehaviorSubject<(UserBook | Book)[]>([]);
   booksSearched$ = new BehaviorSubject<(UserBook | Book)[]>([]);
   numberOfBooks = signal<number>(0);
   toolbarSpacerHeight = signal(0);
   toolbarPinned = signal(false);
   toolbarPinnedTop = signal(0);
   toolbarPinnedLeft = signal(0);
   toolbarPinnedWidth = signal(0);
   titleVisibility = signal(1);
   controlsVisibility = signal(1);

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
      this.toolbarResizeObserver?.disconnect();
      if (this.scrollEndTimer) {
         clearTimeout(this.scrollEndTimer);
      }
   }

   private bindBooksSource() {
      const source = this.booksSourceInternal$ ?? this.booksService.getShelfBooks();
      this.booksSourceSubscription?.unsubscribe();
      this.booksSourceSubscription = source.subscribe(books => {
         this.booksOriginal$.next([...books]);
      });
   }

   ngAfterViewInit() {
      const toolbarElement = this.toolbar?.nativeElement;
      if (toolbarElement) {
         const updateToolbarHeight = () => {
            const expandedHeight = toolbarElement.scrollHeight;
            this.toolbarSpacerHeight.update(currentHeight => Math.max(currentHeight, expandedHeight));
         };

         requestAnimationFrame(updateToolbarHeight);
         this.toolbarResizeObserver = new ResizeObserver(updateToolbarHeight);
         this.toolbarResizeObserver.observe(toolbarElement);
      }

      this.restoreScrollPosition();
   }

   @HostListener('window:beforeunload')
   handleBeforeUnload() {
      this.saveScrollPosition();
   }

   onBooksScroll(event: Event) {
      const element = event.currentTarget as HTMLElement;
      const currentScrollTop = Math.max(0, element.scrollTop);
      const scrollDelta = currentScrollTop - this.lastScrollTop;
      const isDesktop = element.ownerDocument.defaultView?.matchMedia('(min-width: 64rem)').matches ?? false;
      const naturalScrollHeight = this.toolbarSpacerHeight();

      if (currentScrollTop <= 1) {
         this.useNaturalToolbarScroll = true;
         this.toolbarPinned.set(false);
      }

      if (this.useNaturalToolbarScroll && naturalScrollHeight > 0 && currentScrollTop <= naturalScrollHeight) {
         if (this.scrollEndTimer) {
            clearTimeout(this.scrollEndTimer);
         }
         this.titleVisibility.set(1);
         this.controlsVisibility.set(1);
         this.lastScrollTop = currentScrollTop;
         return;
      }

      if (this.useNaturalToolbarScroll && naturalScrollHeight > 0 && this.lastScrollTop <= naturalScrollHeight && currentScrollTop > naturalScrollHeight) {
         this.useNaturalToolbarScroll = false;
         this.titleVisibility.set(0);
         this.controlsVisibility.set(0);
      } else if (scrollDelta < 0) {
         this.pinToolbar(element);
      }

      if (scrollDelta !== 0) {
         this.lastScrollDirection = scrollDelta < 0 ? 'up' : 'down';
         this.schedulePanelSnap(currentScrollTop, isDesktop);
      }

      if (currentScrollTop <= 1) {
         this.titleVisibility.set(1);
      } else if (isDesktop && scrollDelta < 0) {
         this.titleVisibility.update(value => this.clamp(value + Math.abs(scrollDelta) / this.titleCollapseDistance));
      } else if (isDesktop && scrollDelta > 0) {
         this.titleVisibility.update(value => this.clamp(value - scrollDelta / this.titleCollapseDistance));
      } else if (!isDesktop) {
         this.titleVisibility.set(this.clamp(1 - currentScrollTop / this.titleCollapseDistance));
      }

      if (currentScrollTop <= 1) {
         this.controlsVisibility.set(1);
      } else if (scrollDelta > 0) {
         this.controlsVisibility.update(value => this.clamp(value - scrollDelta / this.controlsCollapseDistance));
      } else if (scrollDelta < 0) {
         this.controlsVisibility.update(value => this.clamp(value + Math.abs(scrollDelta) / this.controlsCollapseDistance));
      }

      this.lastScrollTop = currentScrollTop;
   }

   private pinToolbar(scrollElement: HTMLElement) {
      if (this.toolbarPinned()) {
         return;
      }

      const bounds = scrollElement.getBoundingClientRect();
      this.toolbarPinnedTop.set(bounds.top);
      this.toolbarPinnedLeft.set(bounds.left);
      this.toolbarPinnedWidth.set(bounds.width);
      this.toolbarPinned.set(true);
   }

   private schedulePanelSnap(scrollTop: number, isDesktop: boolean) {
      if (this.scrollEndTimer) {
         clearTimeout(this.scrollEndTimer);
      }

      this.scrollEndTimer = setTimeout(() => {
         if (scrollTop <= 1) {
            this.titleVisibility.set(1);
            this.controlsVisibility.set(1);
            return;
         }

         if (this.lastScrollDirection === 'down') {
            this.titleVisibility.set(0);
            this.controlsVisibility.set(0);
            return;
         }

         this.controlsVisibility.set(1);
         this.titleVisibility.set(isDesktop ? 1 : 0);
      }, 140);
   }

   panelRows(visibility: number) {
      return `${visibility}fr`;
   }

   private clamp(value: number) {
      return Math.min(1, Math.max(0, value));
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
                  this.lastScrollTop = y;
                  if (y > 0) {
                     this.titleVisibility.set(this.clamp(1 - y / this.titleCollapseDistance));
                     this.controlsVisibility.set(0);
                  }
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
