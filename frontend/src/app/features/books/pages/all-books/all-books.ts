import { Component, DestroyRef, HostListener, ViewChild, ElementRef, inject, signal, computed, Input, Output, EventEmitter } from '@angular/core';
import { UserBook } from '../../../../types/UserBook.model';
import { Book } from '../../../../types/Book.model';
import { BookCard } from '../../components/book-card/book-card';
import { BooksService } from '../../../../services/booksService';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
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
   imports: [BookCard, FilterList, SearchBar, AsyncPipe, SortList],
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

   private readonly scrollStorageKey = 'all-books-scrollState';
   private readonly titleCollapseDistance = 200;
   private readonly controlsCollapseDistance = 420;
   private hasRestoredScroll = false;
   private lastScrollTop = 0;
   private lastScrollDirection: 'up' | 'down' = 'down';
   private useNaturalToolbarScroll = true;
   private scrollEndTimer?: ReturnType<typeof setTimeout>;
   private mobileToolbarTimer?: ReturnType<typeof setTimeout>;
   private toolbarResizeObserver?: ResizeObserver;
   private mobileBoundaryFrame: number | null = null;
   private mobileToolbarFrame: number | null = null;
   private readonly mobileNavigationListener = (event: Event) => {
      this.handleMobileNavigationVisibility((event as CustomEvent<boolean>).detail);
   };
   private readonly mobilePageTopListener = () => this.restoreNaturalMobileToolbar();
   private readonly mobileWindowScrollListener = () => {
      if (this.isDesktopViewport()) return;

      const scrollElement = this.scrollContainer?.nativeElement;
      if (scrollElement) {
         this.handleBooksScroll(window.scrollY, false, scrollElement);
      }
   };
   private readonly mobileToolbarBoundaryListener = () => {
      if (this.mobileBoundaryFrame !== null) return;

      this.mobileBoundaryFrame = requestAnimationFrame(() => {
         this.mobileBoundaryFrame = null;
         this.releaseToolbarAtNaturalBoundary();
      });
   };
   @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLElement>;
   @ViewChild('toolbar') private toolbar?: ElementRef<HTMLElement>;
   @ViewChild('toolbarTitle') private toolbarTitle?: ElementRef<HTMLElement>;
   booksOriginal$ = new BehaviorSubject<(UserBook | Book)[]>([]);
   booksFiltered$ = new BehaviorSubject<(UserBook | Book)[]>([]);
   booksSearched$ = new BehaviorSubject<(UserBook | Book)[]>([]);
   numberOfBooks = signal<number>(0);
   toolbarSpacerHeight = signal(0);
   toolbarPinned = signal(false);
   toolbarPinnedTop = signal(0);
   toolbarPinnedLeft = signal(0);
   toolbarPinnedWidth = signal(0);
   skipToolbarTransition = signal(false);
   titleVisibility = signal(1);
   controlsVisibility = signal(1);
   readonly toolbarTitleGap = 20;
   readonly toolbarCollapsedPadding = 8;

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
      clearTimeout(this.mobileToolbarTimer);
      this.cancelMobileToolbarFrame();
      window.removeEventListener('mobile-navigation-visibility', this.mobileNavigationListener);
      window.removeEventListener('mobile-page-top', this.mobilePageTopListener);
      window.removeEventListener('scroll', this.mobileWindowScrollListener);
      window.removeEventListener('scroll', this.mobileToolbarBoundaryListener);
      if (this.mobileBoundaryFrame !== null) {
         cancelAnimationFrame(this.mobileBoundaryFrame);
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

      window.addEventListener('mobile-navigation-visibility', this.mobileNavigationListener);
      window.addEventListener('mobile-page-top', this.mobilePageTopListener);
      window.addEventListener('scroll', this.mobileWindowScrollListener, { passive: true });
      window.addEventListener('scroll', this.mobileToolbarBoundaryListener, { passive: true });

      this.restoreScrollPosition();
   }

   private releaseToolbarAtNaturalBoundary() {
      if (!this.toolbarPinned() || window.matchMedia('(min-width: 64rem)').matches) return;

      const scrollElement = this.scrollContainer?.nativeElement;
      const titleElement = this.toolbarTitle?.nativeElement;
      if (!scrollElement || !titleElement) return;

      const naturalControlsTop = scrollElement.getBoundingClientRect().top
         + titleElement.getBoundingClientRect().height + this.toolbarTitleGap;
      const pinnedControlsTop = this.toolbarPinnedTop() + this.toolbarCollapsedPadding;

      if (naturalControlsTop >= pinnedControlsTop) {
         this.restoreNaturalMobileToolbar();
      }
   }

   private restoreNaturalMobileToolbar() {
      if (window.matchMedia('(min-width: 64rem)').matches) return;

      this.cancelMobileToolbarTimer();
      this.cancelMobileToolbarFrame();

      this.skipToolbarTransition.set(true);
      this.useNaturalToolbarScroll = true;
      this.toolbarPinned.set(false);
      this.titleVisibility.set(1);
      this.controlsVisibility.set(1);
      this.scheduleMobileToolbarFrame(() => {
         this.scheduleMobileToolbarFrame(() => this.skipToolbarTransition.set(false));
      });
   }

   private handleMobileNavigationVisibility(visible: boolean) {
      if (window.matchMedia('(min-width: 64rem)').matches) return;

      this.cancelMobileToolbarTimer();

      const toolbarElement = this.toolbar?.nativeElement;
      const scrollElement = this.scrollContainer?.nativeElement;
      if (!toolbarElement || !scrollElement) return;

      const toolbarHasScrolledAway = () =>
         scrollElement.getBoundingClientRect().top + this.toolbarSpacerHeight() < 0;
      if (visible && toolbarHasScrolledAway()) {
         this.mobileToolbarTimer = setTimeout(() => {
            this.mobileToolbarTimer = undefined;

            if (!toolbarHasScrolledAway()) return;

            const bounds = scrollElement.getBoundingClientRect();
            const topHeader = document.querySelector<HTMLElement>('app-root > main > app-header');

            this.skipToolbarTransition.set(true);
            this.titleVisibility.set(0);
            this.toolbarPinnedTop.set(topHeader?.getBoundingClientRect().height ?? 80);
            this.toolbarPinnedLeft.set(bounds.left);
            this.toolbarPinnedWidth.set(bounds.width);
            this.controlsVisibility.set(0);
            this.toolbarPinned.set(true);
            this.scheduleMobileToolbarFrame(() => {
               this.skipToolbarTransition.set(false);
               this.scheduleMobileToolbarFrame(() => {
                  if (this.toolbarPinned() && !this.mobileToolbarTimer) {
                     this.controlsVisibility.set(1);
                  }
               });
            });
         }, 200);
         return;
      }

      if (!visible && this.toolbarPinned()) {
         this.controlsVisibility.set(0);
         this.mobileToolbarTimer = setTimeout(() => {
            this.toolbarPinned.set(false);
            this.mobileToolbarTimer = undefined;
         }, 350);
      }
   }

   private cancelMobileToolbarTimer() {
      clearTimeout(this.mobileToolbarTimer);
      this.mobileToolbarTimer = undefined;
   }

   private scheduleMobileToolbarFrame(callback: () => void) {
      this.cancelMobileToolbarFrame();
      this.mobileToolbarFrame = requestAnimationFrame(() => {
         this.mobileToolbarFrame = null;
         callback();
      });
   }

   private cancelMobileToolbarFrame() {
      if (this.mobileToolbarFrame !== null) {
         cancelAnimationFrame(this.mobileToolbarFrame);
         this.mobileToolbarFrame = null;
      }
   }

   @HostListener('window:beforeunload')
   handleBeforeUnload() {
      this.saveScrollPosition();
   }

   onBooksScroll(event: Event) {
      const element = event.currentTarget as HTMLElement;
      this.handleBooksScroll(element.scrollTop, this.isDesktopViewport(), element);
   }

   private handleBooksScroll(scrollTop: number, isDesktop: boolean, scrollElement: HTMLElement) {
      const currentScrollTop = Math.max(0, scrollTop);
      const scrollDelta = currentScrollTop - this.lastScrollTop;
      const naturalScrollHeight = this.toolbarSpacerHeight();

      if (currentScrollTop <= 1) {
         if (this.scrollEndTimer) {
            clearTimeout(this.scrollEndTimer);
         }
         this.expandToolbarAtPageTop();
         this.lastScrollTop = currentScrollTop;
         return;
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
         this.pinToolbar(scrollElement);
      }

      if (scrollDelta !== 0) {
         this.lastScrollDirection = scrollDelta < 0 ? 'up' : 'down';
         this.schedulePanelSnap(currentScrollTop, isDesktop);
      }

      if (isDesktop && scrollDelta !== 0) {
         this.titleVisibility.update(value => this.clamp(value - scrollDelta / this.titleCollapseDistance));
      } else if (!isDesktop) {
         this.titleVisibility.set(this.clamp(1 - currentScrollTop / this.titleCollapseDistance));
      }

      if (scrollDelta !== 0) {
         this.controlsVisibility.update(value => this.clamp(value - scrollDelta / this.controlsCollapseDistance));
      }

      this.lastScrollTop = currentScrollTop;
   }

   private isDesktopViewport() {
      return window.matchMedia('(min-width: 64rem)').matches;
   }

   private expandToolbarAtPageTop() {
      this.useNaturalToolbarScroll = true;
      this.toolbarPinned.set(false);
      this.titleVisibility.set(1);
      this.controlsVisibility.set(1);
   }

   private pinToolbar(scrollElement: HTMLElement) {
      if (this.toolbarPinned()) {
         return;
      }

      const bounds = scrollElement.getBoundingClientRect();
      const view = scrollElement.ownerDocument.defaultView;
      const desktopHeaderHeight = view?.matchMedia('(min-width: 64rem)').matches
         ? scrollElement.ownerDocument.querySelector<HTMLElement>('app-root > main > app-header')?.getBoundingClientRect().height ?? 0
         : 0;
      this.toolbarPinnedTop.set(Math.max(bounds.top, desktopHeaderHeight));
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

   private clamp(value: number) {
      return Math.min(1, Math.max(0, value));
   }

   private saveScrollPosition() {
      try {
         const el = this.scrollContainer?.nativeElement;
         if (el) {
            const scrollTop = this.isDesktopViewport() ? el.scrollTop : window.scrollY;
            sessionStorage.setItem(this.scrollStorageKey, JSON.stringify({
               mode: this.mode,
               scrollTop: Math.max(0, Math.floor(scrollTop || 0))
            }));
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
            const state = JSON.parse(saved) as { mode?: unknown; scrollTop?: unknown } | null;
            const savedMode = state?.mode;
            const savedScrollTop = state?.scrollTop;
            const isCurrentListState = savedMode === this.mode
               && typeof savedScrollTop === 'number'
               && savedScrollTop >= 0;

            if (isCurrentListState) {
               const y = savedScrollTop;
               requestAnimationFrame(() => {
                  if (this.isDesktopViewport()) {
                     el.scrollTop = y;
                  } else {
                     window.scrollTo(0, y);
                  }

                  const restoredScrollTop = this.isDesktopViewport() ? el.scrollTop : window.scrollY;
                  this.lastScrollTop = restoredScrollTop;
                  if (restoredScrollTop <= 1) {
                     this.expandToolbarAtPageTop();
                  } else if (restoredScrollTop > this.toolbarSpacerHeight()) {
                     this.useNaturalToolbarScroll = false;
                     this.titleVisibility.set(0);
                     this.controlsVisibility.set(0);
                  }
               });
            } else {
               el.scrollTop = 0;
               if (!this.isDesktopViewport()) {
                  window.scrollTo(0, 0);
               }
               this.lastScrollTop = 0;
               this.expandToolbarAtPageTop();
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
