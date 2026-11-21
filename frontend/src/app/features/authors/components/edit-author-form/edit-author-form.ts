import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { Author } from '../../../../types/Author.model';
import { AuthorsService } from '../../../../services/authorsService';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Button } from '../../../../shared/components/button/button';
import { BooksService } from '../../../../services/booksService';
import { Country } from '../../../../types/Country.model';
import { CountriesService } from '../../../../services/countriesService';
import { HotToastService } from '@ngxpert/hot-toast';
import { EditAuthorDTO } from '../../../../dtos/EditAuthorDTO';

@Component({
   selector: 'app-edit-author-form',
   imports: [ReactiveFormsModule, Button],
   templateUrl: './edit-author-form.html',
   styles: '',
   host: { class: 'block h-full min-h-0 overflow-hidden md:h-auto md:max-h-[calc(100dvh-2rem)] lg:min-h-full lg:overflow-visible' }
})
export class EditBookForm implements OnInit {
   @Input() author!: Author;
   @Output() editViewIsOpen = new EventEmitter<boolean>;
   @Output() authorChange = new EventEmitter<Author>();
   @Output() updateBooks = new EventEmitter;

   allCountries = signal<Country[]>([]);
   form!: FormGroup;

   constructor(
      private fb: FormBuilder,
      private authorsService: AuthorsService,
      private countriesService: CountriesService,
      private toast: HotToastService,
      private booksService: BooksService
   ) {}

   ngOnInit(): void {
      this.countriesService.getAllCountries().then(countries => this.allCountries.set(countries));

      this.form = this.fb.group({
         id: [this.author.id],
         firstName: [this.author.firstName, [Validators.required]],
         lastName: [this.author.lastName],
         gender: [this.author.gender],
         birthYear: [this.author.birthYear],
         lifeStatus: [this.author.lifeStatus],
         deathYear: [this.author.deathYear, Validators.max(this.getCurrentYear())],
         countryId: [this.author.country ? this.author.country.id : null],
         imageLink: [this.author.imageLink]
      }, { validators: this.lifeDataValidator() });
   }

   save() {
      if (this.form.valid) {
         const updatedAuthor: EditAuthorDTO = this.form.value;
         if (updatedAuthor.birthYear) {
            updatedAuthor.birthYear = Number(updatedAuthor.birthYear);
         }

         if (updatedAuthor.deathYear) {
            updatedAuthor.deathYear = Number(updatedAuthor.deathYear);
         }

         this.authorsService.editAuthor(updatedAuthor)
            .subscribe((res: unknown) => {
               this.authorChange.emit(res as Author);
               this.closeEditView();
               this.booksService.updateAuthorInBooks(res as Author);
               this.updateBooks.emit();
            });
      } else {
         this.toast.error('Formuläret är inte giltigt. Kontrollera att allt är rätt och försök igen.');
      }
   }

   closeEditView() {
      this.editViewIsOpen.emit(false);
   }

   resetForm() {
      this.form.reset({
         id: [this.author.id],
         firstName: [this.author.firstName],
         lastName: [this.author.lastName],
         gender: [this.author.gender],
         birthYear: [this.author.birthYear],
         lifeStatus: [this.author.lifeStatus],
         deathYear: [this.author.deathYear],
         countryId: [this.author.country ? this.author.country.id : null],
         imageLink: [this.author.imageLink]
      });
   }

   getCurrentYear() {
      return new Date().getFullYear();
   }

   get isDeceased() {
      return this.form?.get('lifeStatus')?.value === 'deceased';
   }

   onLifeStatusChange() {
      if (!this.isDeceased) {
         this.form.get('deathYear')?.setValue(null);
      }
   }

   private lifeDataValidator(): ValidatorFn {
      return (control: AbstractControl) => {
         const lifeStatus = control.get('lifeStatus')?.value;
         const deathYear = control.get('deathYear')?.value;
         const birthYear = control.get('birthYear')?.value;

         if (lifeStatus === 'alive' && deathYear != null) {
            return { deathYearForLivingAuthor: true };
         }

         if (deathYear != null && lifeStatus !== 'deceased') {
            return { deathYearRequiresDeceasedStatus: true };
         }

         const hasCompleteYear = (value: unknown) => /^\d{4}$/.test(String(value));
         if (hasCompleteYear(birthYear) && hasCompleteYear(deathYear) && Number(deathYear) < Number(birthYear)) {
            return { deathYearBeforeBirthYear: true };
         }

         return null;
      };
   }
}
