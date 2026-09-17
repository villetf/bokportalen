import { Component, computed, inject, Input } from '@angular/core';
import { BurgerMenu } from '../burger-menu/burger-menu';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserStore } from '../../../../stores/user.store';
import { AuthService } from '../../../../services/authService';
import { AsyncPipe } from '@angular/common';
import { filter, map, startWith } from 'rxjs';

@Component({
   selector: 'app-header',
   imports: [BurgerMenu, RouterLink, RouterLinkActive, AsyncPipe],
   templateUrl: './header.html',
   standalone: true,
})
export class Header {
   @Input() placement: 'top' | 'bottom' = 'top';

   private readonly userStore = inject(UserStore);
   protected readonly userInitials = computed(() => {
      const user = this.userStore.user();
      const initials = (user?.firstName?.trim().charAt(0) ?? '')
         + (user?.lastName?.trim().charAt(0) ?? '');
      return initials.toUpperCase() || 'U';
   });

   readonly pageTitle$;

   constructor(public auth: AuthService, router: Router) {
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

}
