import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../../../../shared/components/button/button';
import { HotToastService } from '@ngxpert/hot-toast';
import { Genre } from '../../../../types/Genre.model';
import { GenresService } from '../../../../services/genresService';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
   selector: 'app-add-genre',
   imports: [ReactiveFormsModule, Button],
   templateUrl: './add-genre.html',
   styles: ''
})
export class AddGenre {
   form!: FormGroup;

   constructor(
      private fb: FormBuilder,
      private toast: HotToastService,
      private genresService: GenresService
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
         const newGenre: Genre = this.form.value;

         this.genresService.addGenre(newGenre)
            .pipe(
               this.toast.observe({
                  loading: 'Lägger till författare...',
                  success: (res) => {
                     this.resetForm();
                     return `Lade till genren ${(res as Genre).name}!`;
                  },
                  error: (err) => {
                     if ((err as HttpErrorResponse).status == 409) {
                        return 'Denna genre finns redan.';
                     }

                     return 'Något gick fel vid skapande av genre.';
                  }
               })
            )
            .subscribe();
      } else {
         this.toast.error('Uppgifterna är inte giltiga.');
      }
   }
}
