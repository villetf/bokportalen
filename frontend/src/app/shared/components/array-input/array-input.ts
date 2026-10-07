import { Component, forwardRef, Input } from '@angular/core';
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
   @Input() displayFn: (item: T) => string = (i: unknown) => String(i);
   @Input() selectableItems: T[] = [];
   @Input() defaultSelectText!: string;
   disabled = false;

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


   drop(event: CdkDragDrop<T[]>) {
      moveItemInArray(this.items, event.previousIndex, event.currentIndex);
      this.notifyChange();
   }

   addItem() {
      this.items = [...this.items, {} as T];
      this.notifyChange();
   }

   removeItem(index: number) {
      this.items = this.items.filter((_, itemIndex) => itemIndex !== index);
      this.notifyChange();
   }

   itemOccursInList(currentItem: T) {
      return this.items.some(item => item.id === currentItem.id);
   }

   setDisabledState(isDisabled: boolean): void {
      this.disabled = isDisabled;
   }

   addItemToList(event: Event, item: T) {
      const selectedValue = (event.target as HTMLSelectElement).value;
      const selectedObject = this.selectableItems.find(i => String(i.id) === selectedValue);

      const index = this.items.indexOf(item);
      if (index > -1 && selectedObject) {
         this.items = this.items.map((currentItem, itemIndex) => itemIndex === index ? selectedObject : currentItem);
         this.notifyChange();
      }
   }
}
