import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthorsService } from '../../../../services/authorsService';
import { Button } from '../../../../shared/components/button/button';
import { HotToastService } from '@ngxpert/hot-toast';
import { Country } from '../../../../types/Country.model';
import { CountriesService } from '../../../../services/countriesService';
import { AddAuthorDTO } from '../../../../dtos/AddAuthorDTO';

@Component({
   selector: 'app-add-author',
   imports: [ReactiveFormsModule, Button],
   templateUrl: './add-author.html',
   styles: ''
})
export class AddAuthor {
   form!: FormGroup;
   allCountries = signal<Country[]>([]);

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
         country: [],
         imageLink: []
      });
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
   }

   save() {
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
                  success: `Lade till ${newAuthor.firstName}${newAuthor.lastName ? ' ' + newAuthor.lastName : '' }!`,
                  error: 'Något gick fel vid tilläggning.'
               })
            )
            .subscribe({});
      } else {
         this.toast.error('Uppgifterna är inte giltiga.');
      }
   }

   getCurrentYear() {
      return new Date().getFullYear();
   }
}
