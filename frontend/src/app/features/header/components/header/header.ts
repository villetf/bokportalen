import { Component, signal } from '@angular/core';
import { BurgerMenu } from '../burger-menu/burger-menu';
import { RouterLink } from '@angular/router';

@Component({
   selector: 'app-header',
   imports: [BurgerMenu, RouterLink],
   templateUrl: './header.html',
   standalone: true,
})
export class Header {
   showRealCovers = signal<boolean>(this.getCoverSettingFromLs());

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
}
