import { Component, ElementRef, ViewChild } from '@angular/core';
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
   @ViewChild('genreInput') genreInput!: ElementRef<HTMLInputElement>;
   form!: FormGroup;
   formIsSubmitted = false;

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

   ngAfterViewInit() {
      this.focusTitle();
   }

   resetForm() {
      this.form.reset({
         name: []
      });
      setTimeout(() => this.focusTitle(), 0);
   }

   save() {
      this.formIsSubmitted = true;
      if (this.form.valid) {
         const newGenre: Genre = this.form.value;

         this.genresService.addGenre(newGenre)
            .pipe(
               this.toast.observe({
                  loading: 'Lägger till genre...',
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
         this.toast.error('Formuläret är inte giltigt. Kontrollera att allt är rätt och försök igen.');
      }
   }

   private focusTitle() {
      this.genreInput.nativeElement.focus();
   }
}
