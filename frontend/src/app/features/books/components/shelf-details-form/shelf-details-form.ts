import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Button } from '../../../../shared/components/button/button';

@Component({
   selector: 'app-shelf-details-form',
   standalone: true,
   imports: [Button],
   templateUrl: './shelf-details-form.html',
   host: { class: 'block' }
})
export class ShelfDetailsForm {
   @Input() variant: 'mobile' | 'desktop' = 'mobile';
   @Input() status: string | null = null;
   @Input() rating: number | null = null;
   @Input() copies = 1;
   @Input() inShelf = false;

   @Output() statusChange = new EventEmitter<string | null>();
   @Output() ratingChange = new EventEmitter<number | null>();
   @Output() copiesChange = new EventEmitter<number>();
   @Output() saveRequested = new EventEmitter<void>();
   @Output() removeRequested = new EventEmitter<void>();
}
