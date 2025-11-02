import { Component } from '@angular/core';
import { BurgerMenu } from '../burger-menu/burger-menu';
import { RouterLink } from '@angular/router';

@Component({
   selector: 'app-header',
   imports: [BurgerMenu, RouterLink],
   templateUrl: './header.html',
   standalone: true,
})
export class Header {

}
