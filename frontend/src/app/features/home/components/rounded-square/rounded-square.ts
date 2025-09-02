import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rounded-square',
  imports: [],
  templateUrl: './rounded-square.html',
  styleUrl: './rounded-square.css'
})
export class RoundedSquare {
   @Input() title!: string;
}
