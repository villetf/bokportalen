import { Component, signal } from '@angular/core';
import { BurgerMenu } from '../burger-menu/burger-menu';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/authService';
import { AsyncPipe } from '@angular/common';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
   selector: 'app-header',
   imports: [BurgerMenu, RouterLink, AsyncPipe],
   templateUrl: './header.html',
   standalone: true,
})
export class Header {
   showRealCovers = signal<boolean>(this.getCoverSettingFromLs());

   constructor(public auth: AuthService, private router: Router, private toast: HotToastService,) {}

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
