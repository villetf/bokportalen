import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { AuthorsService } from '../../../../services/authorsService';
import { GenresService } from '../../../../services/genresService';
import { LanguagesService } from '../../../../services/languagesService';
import { Author } from '../../../../types/Author.model';
import { Genre } from '../../../../types/Genre.model';
import { Language } from '../../../../types/Language.model';
import { ArrayInput } from '../../../../shared/components/array-input/array-input';
import { Button } from '../../../../shared/components/button/button';
import { Book } from '../../../../types/Book.model';
import { BooksService } from '../../../../services/booksService';
import { HotToastService } from '@ngxpert/hot-toast';
import { AddBookDTO } from '../../../../dtos/AddBookDTO';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
   selector: 'app-add-book',
   imports: [ReactiveFormsModule, ArrayInput, Button],
   templateUrl: './add-book.html',
   styles: ''
})
export class AddBook {
   @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
   form!: FormGroup;
   allAuthors = signal<Author[]>([]);
   allGenres = signal<Genre[]>([]);
   allLanguages = signal<Language[]>([]);
   formIsSubmitted = false;

   displayAuthor = (author: Author) => `${author.lastName ? author.lastName + ', ' : '' }${author.firstName}`;

   compareAuthorsByLastName(a: Author, b: Author) {
      const aLast = (a.lastName || '').toLocaleLowerCase();
      const bLast = (b.lastName || '').toLocaleLowerCase();
      return aLast.localeCompare(bLast);
   }

   constructor(
      private fb: FormBuilder,
      private authorsService: AuthorsService,
      private genresService: GenresService,
      private languagesService: LanguagesService,
      private booksService: BooksService,
      private toast: HotToastService
   ) {}

   ngOnInit(): void {
      this.updateAuthorsList();
      this.updateGenresList();
      this.updateLanguagesList();

      this.form = this.fb.group({
         title: [null, Validators.required],
         authors: [[{}], this.atLeastOneAuthor()],
         yearWritten: [null, Validators.max(this.getCurrentYear())],
         genre: [null],
         language: [null],
         originalLanguage: [null],
         format: [null],
         isbn: [null, Validators.pattern('^[0-9-]+$')],
         coverLink: [null]
      });
   }

   ngAfterViewInit() {
      this.focusTitle();
   }

   resetForm() {
      this.form.reset({
         title: null,
         authors: [[{}]],
         yearWritten: null,
         genre: null,
         language: null,
         originalLanguage: null,
         format: null,
         isbn: null,
         coverLink: null
      });
      setTimeout(() => this.focusTitle(), 0);
      this.formIsSubmitted = false;
   }

   save() {
      this.formIsSubmitted = true;
      if (this.form.valid) {
         const newBook: AddBookDTO = this.form.value;

         if (newBook.isbn) {
            newBook.isbn = Number(newBook.isbn);
         }

         if (newBook.yearWritten) {
            newBook.yearWritten = Number(newBook.yearWritten);
         }

         const selectedAuthors = this.form.value.authors;
         newBook.authors = Array.isArray(selectedAuthors)
            ? selectedAuthors.filter((a: Author) => a && a.id != null).map((a: Author) => a.id)
            : [];

         const g = this.form.value.genre;
         newBook.genre = g && typeof g === 'object' && 'id' in g ? (g as Genre).id : g ?? null;

         const lang = this.form.value.language;
         newBook.language = lang && typeof lang === 'object' && 'id' in lang ? (lang as Language).id : lang ?? null;

         const origLang = this.form.value.originalLanguage;
         newBook.originalLanguage = origLang && typeof origLang === 'object' && 'id' in origLang ? (origLang as Language).id : origLang ?? null;

         newBook.addedWithScanner = false;

         this.booksService.addBook(newBook)
            .pipe(
               this.toast.observe({
                  loading: 'Lägger till bok...',
                  success: (res) => {
                     this.resetForm();
                     return `Lade till ${(res as Book).title}!`;
                  },
                  error: (err) => {
                     if ((err as HttpErrorResponse).status == 409) {
                        return 'Denna bok finns redan.';
                     }

                     return `Något gick fel vid skapande av bok: ${(err as HttpErrorResponse).message}`;
                  }
               })
            )
            .subscribe({
               next: (res) => this.booksService.setBook(res as Book)
            });
      } else {
         this.toast.error('Formuläret är inte giltigt. Kontrollera att allt är rätt och försök igen.');
      }
   }

   getCurrentYear() {
      return new Date().getFullYear();
   }

   private focusTitle() {
      this.titleInput.nativeElement.focus();
   }

   updateAuthorsList() {
      this.authorsService.getAllAuthors().then(authors => this.allAuthors.set(authors));
   }

   updateGenresList() {
      this.genresService.getAllGenres().then(genres => this.allGenres.set(genres));
   }

   updateLanguagesList() {
      this.languagesService.getAllLanguages().then(languages => this.allLanguages.set(languages));
   }

   private atLeastOneAuthor(): ValidatorFn {
      return (control: AbstractControl) => {
         const value = control.value;
         if (Array.isArray(value)) {
            const hasRealAuthor = value.some((author: Author) => author && author.id != null);
            return hasRealAuthor ? null : { required: true };
         }
         return { required: true };
      };
   }
}
