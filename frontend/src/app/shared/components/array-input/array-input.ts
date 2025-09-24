import { Component, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray, CdkDrag, CdkDropList, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Author } from '../../../types/Author.model';

@Component({
   selector: 'app-array-input',
   imports: [CdkDrag, CdkDropList, CdkDragHandle],
   templateUrl: './array-input.html',
   standalone: true
})
export class ArrayInput<T extends { id: number | string }> {
   @Input() items: T[] = [];
   @Input() displayFn: (item: T) => string = (i: any) => String(i);
   @Input() selectableItems: T[] = [];

   drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.items, event.previousIndex, event.currentIndex);
   }

   addItem() {
      // this.items.push('');
   }

   removeItem() {

   }

   itemOccursInList(currentItem: T) {
      return this.items.some(item => item.id === currentItem.id);
   }
}
