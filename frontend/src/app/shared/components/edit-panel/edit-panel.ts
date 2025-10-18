import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-edit-panel',
  imports: [],
  templateUrl: './edit-panel.html',
  styles: ``
})
export class EditPanel {
   @Input()
   closePanel!: () => void;
}
