import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
   selector: 'app-button',
   imports: [NgClass],
   templateUrl: './button.html',
   styles: ''
})
export class Button {
   @Input() type: 'button' | 'submit' | 'reset' = 'button';
   @Input() color: string = 'bg-bookolive';
   @Input() hoverColor: string = 'hover:bg-bookolive-dark';
}
