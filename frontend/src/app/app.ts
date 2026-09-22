import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, NgZone, signal } from '@angular/core';
import { Header } from './features/header/components/header/header';
import { MainContent } from './shared/components/main-content/main-content';
import { AuthSyncService } from './services/authSyncService';

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
   private readonly destroyRef = inject(DestroyRef);
   private readonly ngZone = inject(NgZone);
   private lastScrollTop = 0;
   private scrollFrame: number | null = null;
   private navigationPaintTimer: number | null = null;

   constructor(private authSync: AuthSyncService) {
      afterNextRender(() => this.initializeScrollListener());
   }

   private initializeScrollListener() {
      this.lastScrollTop = Math.max(0, window.scrollY);

      const onScroll = () => {
         if (this.scrollFrame !== null) {
            return;
         }

         this.scrollFrame = window.requestAnimationFrame(() => {
            this.scrollFrame = null;
            this.handleWindowScroll();
         });
      };

      this.ngZone.runOutsideAngular(() => {
         window.addEventListener('scroll', onScroll, { passive: true });
      });

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
      let shouldShowNavigation: boolean | null = null;

      if (currentScrollTop <= 1) {
         shouldShowNavigation = true;
         this.lastScrollTop = currentScrollTop;
      } else if (Math.abs(scrollDelta) >= 4) {
         shouldShowNavigation = scrollDelta < 0;
         this.lastScrollTop = currentScrollTop;
      }

      if (shouldShowNavigation !== null) {
         this.setMobileNavigationVisible(shouldShowNavigation);
      }
   }

   private setMobileNavigationVisible(visible: boolean) {
      if (visible === this.mobileNavigationVisible()) return;

      if (this.navigationPaintTimer !== null) {
         window.clearTimeout(this.navigationPaintTimer);
         this.navigationPaintTimer = null;
      }

      this.ngZone.run(() => {
         if (visible) this.mobileNavigationPainted.set(true);
         this.mobileNavigationVisible.set(visible);
      });

      window.dispatchEvent(new CustomEvent<boolean>('mobile-navigation-visibility', {
         detail: visible
      }));

      if (!visible) {
         this.navigationPaintTimer = window.setTimeout(() => {
            this.navigationPaintTimer = null;
            this.ngZone.run(() => this.mobileNavigationPainted.set(false));
         }, 750);
      }
   }
}
