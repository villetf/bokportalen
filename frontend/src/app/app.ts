import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Header } from './features/header/components/header/header';
import { MainContent } from './shared/components/main-content/main-content';
import { AuthSyncService } from './services/authSyncService';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
   selector: 'app-root',
   imports: [Header, MainContent],
   templateUrl: './app.html',
   styleUrl: './app.css',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
   protected readonly title = signal('bokportalen');
   protected readonly mobileNavigationVisible = signal(true);
   protected readonly mobileNavigationPainted = signal(true);
   protected readonly bookPageActive = signal(false);
   private readonly destroyRef = inject(DestroyRef);
   private lastScrollTop = 0;
   private wasAtPageTop = true;
   private scrollFrame: number | null = null;
   private navigationPaintTimer: number | null = null;

   constructor(private authSync: AuthSyncService, private router: Router) {
      this.router.events
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(event => {
            if (event instanceof NavigationEnd) {
               this.bookPageActive.set(/^\/books\/\d+(?:[/?#]|$)/.test(event.urlAfterRedirects));
            }
         });

      afterNextRender(() => this.initializeScrollListener());
   }

   private initializeScrollListener() {
      this.lastScrollTop = Math.max(0, window.scrollY);
      this.wasAtPageTop = this.lastScrollTop <= 1;

      const onScroll = () => {
         if (this.scrollFrame !== null) {
            return;
         }

         this.scrollFrame = window.requestAnimationFrame(() => {
            this.scrollFrame = null;
            this.handleWindowScroll();
         });
      };

      window.addEventListener('scroll', onScroll, { passive: true });

      this.destroyRef.onDestroy(() => {
         window.removeEventListener('scroll', onScroll);
         if (this.scrollFrame !== null) {
            window.cancelAnimationFrame(this.scrollFrame);
         }
         if (this.navigationPaintTimer !== null) {
            window.clearTimeout(this.navigationPaintTimer);
         }
      });
   }

   private handleWindowScroll() {
      const currentScrollTop = Math.max(0, window.scrollY);

      if (window.matchMedia('(min-width: 64rem)').matches) {
         this.lastScrollTop = currentScrollTop;
         return;
      }

      const scrollDelta = currentScrollTop - this.lastScrollTop;
      const isAtPageTop = currentScrollTop <= 1;

      // Ignore small scroll movements to avoid flickering navigation.
      if (isAtPageTop || Math.abs(scrollDelta) >= 4) {
         this.lastScrollTop = currentScrollTop;
         this.setMobileNavigationVisible(isAtPageTop || scrollDelta < 0);
      }

      if (isAtPageTop && !this.wasAtPageTop) {
         window.dispatchEvent(new Event('mobile-page-top'));
      }
      this.wasAtPageTop = isAtPageTop;
   }

   private setMobileNavigationVisible(visible: boolean) {
      if (visible === this.mobileNavigationVisible()) return;

      if (this.navigationPaintTimer !== null) {
         window.clearTimeout(this.navigationPaintTimer);
         this.navigationPaintTimer = null;
      }

      if (visible) this.mobileNavigationPainted.set(true);
      this.mobileNavigationVisible.set(visible);

      window.dispatchEvent(new CustomEvent<boolean>('mobile-navigation-visibility', {
         detail: visible
      }));

      if (!visible) {
         // Hide only after the header's 350 ms delay and 400 ms slide have finished.
         this.navigationPaintTimer = window.setTimeout(() => {
            this.navigationPaintTimer = null;
            this.mobileNavigationPainted.set(false);
         }, 750);
      }
   }
}
