import { Component, Input } from '@angular/core';
import { BurgerMenu } from '../burger-menu/burger-menu';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../services/authService';
import { AsyncPipe } from '@angular/common';
import { filter, map, startWith } from 'rxjs';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
   selector: 'app-header',
   imports: [BurgerMenu, RouterLink, RouterLinkActive, AsyncPipe],
   templateUrl: './header.html',
   standalone: true,
})
export class Header {
   @Input() placement: 'top' | 'bottom' = 'top';

   readonly pageTitle$;

   constructor(public auth: AuthService, private router: Router, private toast: HotToastService) {
      this.pageTitle$ = router.events.pipe(
         filter(event => event instanceof NavigationEnd),
         startWith(null),
         map(() => {
            let route = router.routerState.snapshot.root;
            while (route.firstChild) route = route.firstChild;
            return route.data['headerTitle'] ?? 'Bokportalen';
         }),
      );
   }

   readonly mobileItems = [
      { route: '/books', label: 'Bokhylla', queryParams: {}, icon: 'M4 3h4v18H4zM10 3h4v18h-4zM16 4l4-1 3 17-4 1z' },
      { route: '/books/archive', label: 'Bokarkiv', queryParams: {}, icon: 'M3 3h18v4H3zM5 7v14h14V7M10 11h4' },
      { route: '/scan', label: 'Skanna', queryParams: {}, icon: 'M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5M7 7v10M10 7v10M14 7v10M17 7v10' },
      { route: '/add', label: 'Lägg till', queryParams: { resource: 'book' }, icon: 'M12 5v14M5 12h14' },
   ];

   async logout() {
      try {
         await this.auth.logout();
         this.router.navigate(['/login']);
      } catch (err: any) {
         this.toast.error('Utloggning misslyckades. Försök igen.');
         console.error('Logout failed with error:', err);
      }
   }
}
