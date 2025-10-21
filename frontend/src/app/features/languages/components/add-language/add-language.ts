import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../../../../shared/components/button/button';
import { HotToastService } from '@ngxpert/hot-toast';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguagesService } from '../../../../services/languagesService';
import { Language } from '../../../../types/Language.model';

@Component({
   selector: 'app-add-language',
   imports: [ReactiveFormsModule, Button],
   templateUrl: './add-language.html',
   styles: ''
})
export class AddLanguage {
   form!: FormGroup;

   constructor(
      private fb: FormBuilder,
      private toast: HotToastService,
      private languagesService: LanguagesService
   ) {}

   ngOnInit(): void {
      this.form = this.fb.group({
         name: [[], [Validators.required]]
      });
   }

   resetForm() {
      this.form.reset({
         name: []
      });
   }

   save() {
      if (this.form.valid) {
         const newLanguage: Language = this.form.value;

         this.languagesService.addLanguage(newLanguage)
            .pipe(
               this.toast.observe({
                  loading: 'Lägger till språk...',
                  success: (res) => {
                     this.resetForm();
                     return `Lade till språket ${(res as Language).name}!`;
                  },
                  error: (err) => {
                     if ((err as HttpErrorResponse).status == 409) {
                        return 'Detta språk finns redan.';
                     }

                     return 'Något gick fel vid skapande av språk.';
                  }
               })
            )
            .subscribe();
      } else {
         this.toast.error('Uppgifterna är inte giltiga.');
      }
   }
}
