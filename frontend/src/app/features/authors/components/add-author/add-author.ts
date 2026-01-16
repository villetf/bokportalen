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
         firstName: [null, Validators.required],
         lastName: [null],
         gender: [null],
         birthYear: [null, Validators.max(this.getCurrentYear())],
         country: [null],
         imageLink: [null]
      });
   }

   ngAfterViewInit() {
      this.focusTitle();
   }

   resetForm() {
      this.form.reset({
         firstName: null,
         lastName: null,
         gender: null,
         birthYear: null,
         country: null,
         imageLink: null
      });
      setTimeout(() => this.focusTitle(), 0);
      this.formIsSubmitted = false;
   }

   save() {
      this.formIsSubmitted = true;
      if (this.form.valid) {
         const newAuthor: AddAuthorDTO = this.form.value;
         if (newAuthor.birthYear) {
            newAuthor.birthYear = Number(newAuthor.birthYear);
         }

         const selectedCountry = this.form.value.country;
         if (selectedCountry && typeof selectedCountry === 'object' && 'id' in selectedCountry) {
            newAuthor.country = (selectedCountry as Country).id;
         } else {
            newAuthor.country = selectedCountry ?? null;
         }

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
