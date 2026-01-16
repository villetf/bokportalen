import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { ArrayInput } from '../../../../shared/components/array-input/array-input';
import { Book } from '../../../../types/Book.model';
import { Author } from '../../../../types/Author.model';
import { AuthorsService } from '../../../../services/authorsService';
import { Genre } from '../../../../types/Genre.model';
import { GenresService } from '../../../../services/genresService';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HotToastService } from '@ngxpert/hot-toast';
import { HttpErrorResponse } from '@angular/common/http';
import { Language } from '../../../../types/Language.model';
import { LanguagesService } from '../../../../services/languagesService';
import { Button } from '../../../../shared/components/button/button';
import { BooksService } from '../../../../services/booksService';
import { DeleteConfirmation } from '../delete-confirmation/delete-confirmation';

@Component({
   selector: 'app-edit-book-form',
   imports: [ReactiveFormsModule, ArrayInput, Button, DeleteConfirmation],
   templateUrl: './edit-book-form.html',
   styles: ''
})
export class EditBookForm implements OnInit {
   @Input() book!: Book;
   @Output() editViewIsOpen = new EventEmitter<boolean>;
   @Output() bookChange = new EventEmitter<Book>();

   allAuthors = signal<Author[]>([]);
   allGenres = signal<Genre[]>([]);
   allLanguages = signal<Language[]>([]);
   deleteConfirmationIsOpen = signal<boolean>(false);
   form!: FormGroup;
   formIsSubmitted = false;


   displayAuthor = (author: Author) => `${author.lastName ? author.lastName + ', ' : '' }${author.firstName}`;

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
         id: [this.book.id],
         title: [this.book.title, [Validators.required]],
         authors: [this.book.authors, [this.atLeastOneAuthor()]],
         yearWritten: [this.book.yearWritten, [Validators.max(this.getCurrentYear())]],
         genre: [this.book.genre ? this.book.genre.id : null],
         language: [this.book.language ? this.book.language.id : null],
         originalLanguage: [this.book.originalLanguage ? this.book.originalLanguage.id : null],
         format: [this.book.format],
         isbn: [Number(this.book.isbn), [Validators.pattern('^[0-9-]+$')]],
         status: [this.book.status],
         copies: [this.book.copies, [Validators.required, Validators.min(1)]],
         rating: [this.book.rating],
         coverLink: [this.book.coverLink]
      });
   }

   save() {
      this.formIsSubmitted = true;
      if (this.form.valid) {
         const updatedBook: Book = this.form.value;
         if (updatedBook.isbn) {
            updatedBook.isbn = Number(updatedBook.isbn);
         }
         this.booksService.editBook(updatedBook)
            .pipe(
               this.toast.observe({
                  loading: 'Uppdaterar bok...',
                  success: (res) => {
                     this.bookChange.emit(res as Book);
                     this.closeEditView();
                     return `Uppdaterade ${(res as Book).title}!`;
                  },
                  error: (err) => {
                     return `Något gick fel vid uppdatering av bok: ${(err as HttpErrorResponse).message}`;
                  }
               })
            )
            .subscribe();

      } else {
         this.toast.error('Formuläret är inte giltigt. Kontrollera att allt är rätt och försök igen.');
      }
   }

   closeEditView() {
      this.editViewIsOpen.emit(false);
   }

   resetForm() {
      this.form.reset({
         id: [this.book.id],
         title: [this.book.title],
         authors: [...this.book.authors],
         yearWritten: [this.book.yearWritten],
         genre: [this.book.genre ? this.book.genre.id : null],
         language: [this.book.language ? this.book.language.id : null],
         originalLanguage: [this.book.originalLanguage ? this.book.originalLanguage.id : null],
         format: [this.book.format],
         isbn: [this.book.isbn],
         status: [this.book.status],
         copies: [this.book.copies, [Validators.required, Validators.min(1)]],
         rating: [this.book.rating],
         coverLink: [this.book.coverLink]
      });
   }

   getCurrentYear() {
      return new Date().getFullYear();
   }

   openDeleteConfirmation() {
      this.deleteConfirmationIsOpen.set(true);
   }

   closeDeleteConfirmation = () => {
      this.deleteConfirmationIsOpen.set(false);
   };

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
