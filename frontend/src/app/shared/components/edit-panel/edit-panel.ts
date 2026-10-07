import { DOCUMENT } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
   selector: 'app-edit-panel',
   imports: [],
   templateUrl: './edit-panel.html',
   styles: ''
})
export class EditPanel implements OnInit, OnDestroy {
   @Input()
      closePanel!: () => void;

   @Input() fitContent = false;

   private readonly document = inject(DOCUMENT);
   private scrollPosition = 0;
   private previousBodyStyles = {
      overflow: '',
      position: '',
      top: '',
      left: '',
      right: '',
      width: ''
   };
   private previousDocumentOverflow = '';

   ngOnInit() {
      const window = this.document.defaultView;
      if (!window) return;

      const bodyStyle = this.document.body.style;
      this.scrollPosition = window.scrollY;
      this.previousDocumentOverflow = this.document.documentElement.style.overflow;
      this.previousBodyStyles = {
         overflow: bodyStyle.overflow,
         position: bodyStyle.position,
         top: bodyStyle.top,
         left: bodyStyle.left,
         right: bodyStyle.right,
         width: bodyStyle.width
      };

      this.document.documentElement.style.overflow = 'hidden';
      bodyStyle.overflow = 'hidden';
      bodyStyle.position = 'fixed';
      bodyStyle.top = `-${this.scrollPosition}px`;
      bodyStyle.left = '0';
      bodyStyle.right = '0';
      bodyStyle.width = '100%';
   }

   ngOnDestroy() {
      const window = this.document.defaultView;
      if (!window) return;

      const bodyStyle = this.document.body.style;
      this.document.documentElement.style.overflow = this.previousDocumentOverflow;
      Object.assign(bodyStyle, this.previousBodyStyles);
      window.scrollTo(0, this.scrollPosition);
   }
}
