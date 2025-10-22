import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

   displayAuthor = (author: Author) => `${author.firstName}${author.lastName ? ' ' + author.lastName : '' }`;

   constructor(
      private fb: FormBuilder,
      private authorsService: AuthorsService,
      private genresService: GenresService,
      private languagesService: LanguagesService,
      private booksService: BooksService,
      private toast: HotToastService
   ) {}

   ngOnInit(): void {
      this.authorsService.getAllAuthors().then(authors => this.allAuthors.set(authors));
      this.genresService.getAllGenres().then(genres => this.allGenres.set(genres));
      this.languagesService.getAllLanguages().then(languages => this.allLanguages.set(languages));


      this.form = this.fb.group({
         title: [[], [Validators.required]],
         authors: [[{}], [Validators.required, Validators.minLength(1)]],
         yearWritten: [[], [Validators.max(this.getCurrentYear())]],
         genre: [],
         language: [],
         originalLanguage: [],
         format: [],
         isbn: [[], [Validators.pattern('^[0-9-]+$')]],
         coverLink: []
      });
   }

   ngAfterViewInit() {
      this.focusTitle();
   }

   resetForm() {
      this.form.reset({
         title: [],
         authors: [[{}]],
         yearWritten: [],
         genre: [],
         language: [],
         originalLanguage: [],
         format: [],
         isbn: [],
         coverLink: []
      });
      setTimeout(() => this.focusTitle(), 0);
   }

   save() {
      this.formIsSubmitted = true;
      if (this.form.valid && !JSON.stringify(this.form.value.authors).match('{}')) {
         const newBook: AddBookDTO = this.form.value;
         if (newBook.isbn) {
            newBook.isbn = Number(newBook.isbn);
         }

         if (newBook.yearWritten) {
            newBook.yearWritten = Number(newBook.yearWritten);
         }

         let authorIds = [];
         authorIds = this.form.value.authors.map((author: Author) => author.id);
         newBook.authors = authorIds;

         newBook.addedWithScanner = false;

         console.log('bok', newBook);

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
}
