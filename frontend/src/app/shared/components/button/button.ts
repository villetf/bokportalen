import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
   selector: 'app-button',
   imports: [NgClass],
   templateUrl: './button.html',
   host: {
      class: 'inline-block max-w-full',
      '[class.w-full]': "width !== 'auto'",
      '[class.lg:w-auto]': "width === 'mobile-full'"
   }
})
export class Button {
   @Input() type: 'button' | 'submit' | 'reset' = 'button';
   @Input() color: string = 'bg-bookolive';
   @Input() hoverColor: string = 'hover:bg-bookolive-dark';
   @Input() disabled = false;
   @Input() outlined = false;
   @Input() pressed: boolean | null = null;
   @Input() width: 'auto' | 'full' | 'mobile-full' = 'auto';
}
