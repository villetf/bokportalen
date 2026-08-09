import { Component, signal } from '@angular/core';

@Component({
   selector: 'app-scan-page',
   standalone: true,
   templateUrl: './scan-page.html'
})
export class ScanPage {
   protected isbn = signal('');

   protected updateIsbn(event: Event) {
      const input = event.target as HTMLInputElement | null;
      const digitsOnly = input?.value.replace(/[^0-9]/g, '') ?? '';

      if (input && input.value !== digitsOnly) {
         input.value = digitsOnly;
      }

      this.isbn.set(digitsOnly);
   }
}