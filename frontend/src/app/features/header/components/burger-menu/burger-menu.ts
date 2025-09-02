import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-burger-menu',
  imports: [],
  templateUrl: './burger-menu.html',
  standalone: true
})

export class BurgerMenu {
   @Input() backgroundColor?: string;

   isOpen = false;

   toggleMenu() {
      this.isOpen = !this.isOpen;
   }

   closeMenu() {
      this.isOpen = false;
   }

   closeMenuOnLinkClick(event: Event) {
      const target = event.target as HTMLElement;
      if (target.closest('a')) {
      this.closeMenu();
      }
   }

   get bgColor() {
      return this.backgroundColor ?? '#8DC689';
   }
}
