import { Component, Input } from '@angular/core';

@Component({
   selector: 'app-rounded-square',
   imports: [],
   templateUrl: './rounded-square.html'
})
export class RoundedSquare {
   @Input() title!: string;
}
