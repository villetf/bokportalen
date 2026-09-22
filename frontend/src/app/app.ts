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
   private readonly destroyRef = inject(DestroyRef);
   private readonly ngZone = inject(NgZone);
   private lastScrollTop = 0;
   private scrollFrame: number | null = null;

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

      if (shouldShowNavigation !== null && shouldShowNavigation !== this.mobileNavigationVisible()) {
         this.ngZone.run(() => this.mobileNavigationVisible.set(shouldShowNavigation));
      }
   }
}
