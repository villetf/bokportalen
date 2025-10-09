import { Component, Input, signal } from '@angular/core';
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
   selectedItem = signal<T | null>(null);

   drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.items, event.previousIndex, event.currentIndex);
   }

   addItem() {
      this.items.push({} as T);
   }

   removeItem(item: T) {
      console.log('sak att ta bort', item);
      this.items = this.items.filter(i => i.id !== item.id);
      this.setSelectedItem(null);
   }

   itemOccursInList(currentItem: T) {
      return this.items.some(item => item.id === currentItem.id);
   }

   setSelectedItem(item: T | null) {
      console.log(this.items);
      this.selectedItem.set(item);
   }

   addItemToList(event: Event, item: T) {
      const selectedIndex = Number((event.target as HTMLSelectElement).value);
      const selectedObject = this.selectableItems.find(i => i.id === selectedIndex);

      const index = this.items.indexOf(item);
      if (index > -1) {
         this.items[index] = selectedObject!;
      }
   }
}
