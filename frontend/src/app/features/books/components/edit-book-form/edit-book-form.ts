import { Component, EventEmitter, Input, OnInit, Output, Signal, signal } from '@angular/core';
import { ArrayInput } from "../../../../shared/components/array-input/array-input";
import { Book } from '../../../../types/Book.model';
import { Author } from '../../../../types/Author.model';
import { AuthorsService } from '../../../../services/authorsService';
import { Genre } from '../../../../types/Genre.model';
import { GenresService } from '../../../../services/genresService';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Language } from '../../../../types/Language.model';
import { LanguagesService } from '../../../../services/languagesService';
import { Button } from "../../../../shared/components/button/button";
import { BooksService } from '../../../../services/booksService';

@Component({
  selector: 'app-edit-book-form',
  imports: [ReactiveFormsModule, ArrayInput, Button],
  templateUrl: './edit-book-form.html',
  styles: ``
})
export class EditBookForm implements OnInit {
   @Input() book!: Book;
   @Output() editViewIsOpen = new EventEmitter<boolean>;
   @Output() bookChange = new EventEmitter<Book>();

   allAuthors = signal<Author[]>([]);
   allGenres = signal<Genre[]>([]);
   allLanguages = signal<Language[]>([]);
   form!: FormGroup;
   

   displayAuthor = (author: Author) => `${author.firstName} ${author.lastName}`;

   constructor(
      private fb: FormBuilder, 
      private authorsService: AuthorsService, 
      private genresService: GenresService,
      private languagesService: LanguagesService,
      private booksService: BooksService
   ) {}

   ngOnInit(): void {
      this.authorsService.getAllAuthors().then(authors => this.allAuthors.set(authors));
      this.genresService.getAllGenres().then(genres => this.allGenres.set(genres));
      this.languagesService.getAllLanguages().then(languages => this.allLanguages.set(languages));


      this.form = this.fb.group({
         id: [this.book.id],
         title: [this.book.title],
         authors: [this.book.authors],
         yearWritten: [this.book.yearWritten],
         genre: [this.book.genre ? this.book.genre.id : null],
         language: [this.book.language ? this.book.language.id : null],
         originalLanguage: [this.book.originalLanguage ? this.book.originalLanguage.id : null],
         format: [this.book.format],
         isbn: [Number(this.book.isbn)],
         status: [this.book.status],
         copies: [this.book.copies, [Validators.required, Validators.min(1)]],
         rating: [this.book.rating],
         coverLink: [this.book.coverLink]
      })
   }

   save() {
      if (this.form.valid) {
         const updatedBook: Book = this.form.value;
         if (updatedBook.isbn) {
            updatedBook.isbn = Number(updatedBook.isbn)
         }

         this.booksService.editBook(updatedBook)
            .subscribe((res: any) => {
               this.bookChange.emit(res as Book);
               this.closeEditView();
            })

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
}
