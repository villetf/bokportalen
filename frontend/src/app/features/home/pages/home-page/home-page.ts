import { Component } from '@angular/core';
import { RoundedSquare } from "../../components/rounded-square/rounded-square";
import { BurgerMenu } from "../../../header/components/burger-menu/burger-menu";

@Component({
   selector: 'app-home-page',
   imports: [RoundedSquare],
   templateUrl: './home-page.html'
})
export class HomePage {

}
