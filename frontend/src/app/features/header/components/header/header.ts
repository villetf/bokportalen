import { Component, signal } from '@angular/core';
import { BurgerMenu } from '../burger-menu/burger-menu';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/authService';
import { AsyncPipe } from '@angular/common';

@Component({
   selector: 'app-header',
   imports: [BurgerMenu, RouterLink, AsyncPipe],
   templateUrl: './header.html',
   standalone: true,
})
export class Header {
   showRealCovers = signal<boolean>(this.getCoverSettingFromLs());

   constructor(public auth: AuthService, private router: Router) {}

   getCoverSettingFromLs() {
      const setting = localStorage.getItem('showRealCovers');
      if (!setting) {
         return true;
      }

      return setting === 'true';
   }

   setCoverSetting(value: boolean) {
      this.showRealCovers.set(value);
      localStorage.setItem('showRealCovers', String(value));
      window.location.reload();
   }

   logout() {
      this.auth.logout();
      this.router.navigate(['/login']);
   }
}
