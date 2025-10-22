import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthorsService } from '../../../../services/authorsService';
import { Button } from '../../../../shared/components/button/button';
import { HotToastService } from '@ngxpert/hot-toast';
import { Country } from '../../../../types/Country.model';
import { CountriesService } from '../../../../services/countriesService';
import { AddAuthorDTO } from '../../../../dtos/AddAuthorDTO';
import { Author } from '../../../../types/Author.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
   selector: 'app-add-author',
   imports: [ReactiveFormsModule, Button],
   templateUrl: './add-author.html',
   styles: ''
})
export class AddAuthor {
   @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;
   form!: FormGroup;
   allCountries = signal<Country[]>([]);
   formIsSubmitted = false;

   constructor(
      private fb: FormBuilder,
      private countriesService: CountriesService,
      private authorsService: AuthorsService,
      private toast: HotToastService
   ) {}

   ngOnInit(): void {
      this.countriesService.getAllCountries().then(countries => this.allCountries.set(countries));

      this.form = this.fb.group({
         firstName: [[], [Validators.required]],
         lastName: [],
         gender: [],
         birthYear: [[], [Validators.max(this.getCurrentYear())]],
         country: [167],
         imageLink: []
      });
   }

   ngAfterViewInit() {
      this.focusTitle();
   }

   resetForm() {
      this.form.reset({
         firstName: [],
         lastName: [],
         gender: [],
         birthYear: [],
         country: [],
         imageLink: []
      });
      setTimeout(() => this.focusTitle(), 0);
   }

   save() {
      this.formIsSubmitted = true;
      if (this.form.valid) {
         const newAuthor: AddAuthorDTO = this.form.value;
         if (newAuthor.birthYear) {
            newAuthor.birthYear = Number(newAuthor.birthYear);
         }

         newAuthor.country = this.form.value.country.id;

         this.authorsService.addAuthor(newAuthor)
            .pipe(
               this.toast.observe({
                  loading: 'Lägger till författare...',
                  success: (res) => {
                     this.resetForm();
                     return `Lade till ${(res as Author).firstName}${(res as Author).lastName ? ' ' + (res as Author).lastName : '' }!`;
                  },
                  error: (err) => {
                     if ((err as HttpErrorResponse).status == 409) {
                        return 'Denna författare finns redan.';
                     }

                     return `Något gick fel vid skapande av författare: ${(err as HttpErrorResponse).message}`;
                  }
               })
            )
            .subscribe({});
      } else {
         this.toast.error('Formuläret är inte giltigt. Kontrollera att allt är rätt och försök igen.');
      }
   }

   getCurrentYear() {
      return new Date().getFullYear();
   }

   private focusTitle() {
      this.nameInput.nativeElement.focus();
   }
}
