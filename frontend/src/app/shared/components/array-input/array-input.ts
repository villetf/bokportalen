import { Component, forwardRef, Input, signal } from '@angular/core';
import { CdkDragDrop, moveItemInArray, CdkDrag, CdkDropList, CdkDragHandle } from '@angular/cdk/drag-drop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
   selector: 'app-array-input',
   imports: [CdkDrag, CdkDropList, CdkDragHandle],
   templateUrl: './array-input.html',
   standalone: true,
   providers: [
      {
         provide: NG_VALUE_ACCESSOR,
         useExisting: forwardRef(() => ArrayInput),
         multi: true
      }
   ]
})
export class ArrayInput<T extends { id: number | string }> implements ControlValueAccessor {
   @Input() items: T[] = [];
   @Input() displayFn: (item: T) => string = (i: any) => String(i);
   @Input() selectableItems: T[] = [];
   selectedItem = signal<T | null>(null);

   private onChange: (value: T[]) => void = () => {};
   private onTouched: () => void = () => {};

   writeValue(obj: T[]): void {
      this.items = obj ? [...obj] : [];
   }

   registerOnChange(fn: (value: T[]) => void): void {
      this.onChange = fn;
   }

   registerOnTouched(fn: () => void): void {
      this.onTouched = fn;
   }

   private notifyChange() {
      this.onChange([...this.items]);
      this.onTouched();
   }


   drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.items, event.previousIndex, event.currentIndex);
      this.notifyChange();
   }

   addItem() {
      this.items.push({} as T);
      this.notifyChange();
   }

   removeItem(item: T) {
      this.items = this.items.filter(i => i.id !== item.id);
      this.setSelectedItem(null);
      this.notifyChange();
   }

   itemOccursInList(currentItem: T) {
      return this.items.some(item => item.id === currentItem.id);
   }

   setSelectedItem(item: T | null) {
      this.selectedItem.set(item);
   }

   addItemToList(event: Event, item: T) {
      const selectedIndex = Number((event.target as HTMLSelectElement).value);
      const selectedObject = this.selectableItems.find(i => i.id === selectedIndex);

      const index = this.items.indexOf(item);
      if (index > -1) {
         this.items[index] = selectedObject!;
         this.notifyChange();
      }
   }
}
