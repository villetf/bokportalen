import { Component, signal } from '@angular/core';
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

@Component({
   selector: 'app-add-book',
   imports: [ReactiveFormsModule, ArrayInput, Button],
   templateUrl: './add-book.html',
   styles: ''
})
export class AddBook {
   form!: FormGroup;
   allAuthors = signal<Author[]>([]);
   allGenres = signal<Genre[]>([]);
   allLanguages = signal<Language[]>([]);

   displayAuthor = (author: Author) => `${author.firstName} ${author.lastName}`;

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
   }

   save() {
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
                  success: `Lade till ${newBook.title}!`,
                  error: 'Något gick fel vid tilläggning.'
               })
            )
            .subscribe({
               next: (res) => this.booksService.setBook(res as Book)
            });
      } else {
         this.toast.error('Uppgifterna är inte giltiga.');
      }
   }

   getCurrentYear() {
      return new Date().getFullYear();
   }
}
