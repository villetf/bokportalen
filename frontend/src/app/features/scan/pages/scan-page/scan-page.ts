import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ArrayInput } from '../../../../shared/components/array-input/array-input';
import { AuthorsService } from '../../../../services/authorsService';
import { BooksService } from '../../../../services/booksService';
import { GenresService } from '../../../../services/genresService';
import { LanguagesService } from '../../../../services/languagesService';
import { Author } from '../../../../types/Author.model';
import { Book } from '../../../../types/Book.model';
import { Genre } from '../../../../types/Genre.model';
import { Language } from '../../../../types/Language.model';
import { AddBookDTO } from '../../../../dtos/AddBookDTO';
import { ISBNLookupResponse } from '../../../../types/ISBNLookupResponse.model';
import { HotToastService } from '@ngxpert/hot-toast';
import { HttpErrorResponse } from '@angular/common/http';
import { BookCard } from '../../../books/components/book-card/book-card';
import { AddAuthorDTO } from '../../../../dtos/AddAuthorDTO';

type ScanMode = 'idle' | 'choose-title' | 'editing' | 'new';

@Component({
   selector: 'app-scan-page',
   standalone: true,
   imports: [ReactiveFormsModule, ArrayInput, NgClass, BookCard],
   templateUrl: './scan-page.html'
})
export class ScanPage {
   @ViewChild('searchIsbnInput') searchIsbnInput?: ElementRef<HTMLInputElement>;

   form: FormGroup;
   searchIsbn = signal('');
   searching = signal(false);
   saving = signal(false);
   lookup = signal<ISBNLookupResponse | null>(null);
   scanMode = signal<ScanMode>('idle');
   searchError = signal('');
   noInfoFound = signal(false);
   selectedBook = signal<Book | null>(null);
   titleMatches = signal<Book[]>([]);
   selectedTitleBookId = signal<number | null>(null);
   currentBookInShelf = signal(false);
   allAuthors = signal<Author[]>([]);
   allGenres = signal<Genre[]>([]);
   allLanguages = signal<Language[]>([]);
   unresolvedAuthors = signal<string[]>([]);
   currentUnresolvedAuthor = signal<string | null>(null);
   authorFormIsOpen = signal(false);
   savingAuthor = signal(false);
   formIsSubmitted = false;

   displayAuthor = (author: Author) => `${author.lastName ? author.lastName + ', ' : ''}${author.firstName}`;

   constructor(
      private fb: FormBuilder,
      private booksService: BooksService,
      private authorsService: AuthorsService,
      private genresService: GenresService,
      private languagesService: LanguagesService,
      private toast: HotToastService
   ) {
      this.form = this.fb.group({
         title: [null, Validators.required],
         authors: [[] as Author[], this.atLeastOneAuthor()],
         yearWritten: [null, Validators.max(this.getCurrentYear())],
         genre: [null],
         language: [null],
         originalLanguage: [null],
         format: [null],
         isbn: [null, Validators.pattern('^[0-9-]+$')],
         coverLink: [null],
         addToShelf: [true]
      });
   }

   async ngOnInit() {
      await Promise.all([
         this.updateAuthorsList(),
         this.updateGenresList(),
         this.updateLanguagesList()
      ]);
   }

   protected updateIsbn(event: Event) {
      const input = event.target as HTMLInputElement | null;
      const digitsOnly = input?.value.replace(/[^0-9]/g, '') ?? '';

      if (input && input.value !== digitsOnly) {
         input.value = digitsOnly;
      }

      this.searchIsbn.set(digitsOnly);
   }

   async search() {
      const isbn = this.searchIsbn();
      if (!isbn) {
         this.searchError.set('Skriv in ett ISBN först.');
         return;
      }

      this.searching.set(true);
      this.searchError.set('');
      this.noInfoFound.set(false);
      this.lookup.set(null);
      this.scanMode.set('idle');
      this.titleMatches.set([]);
      this.selectedTitleBookId.set(null);
      this.selectedBook.set(null);
      this.currentBookInShelf.set(false);
      this.formIsSubmitted = false;

      try {
         const [lookup, books] = await Promise.all([
            firstValueFrom(this.booksService.searchBookByIsbn(isbn)),
            firstValueFrom(this.booksService.getAllBooksWithShelfStatus())
         ]);

         this.lookup.set(lookup);
         this.updateAuthorQueue(this.collectUnresolvedAuthors(lookup.authors));

         const isbnMatch = books.find(book => this.normalizeIsbn(book.isbn) === isbn);
         if (isbnMatch) {
            this.openExistingBook(isbnMatch, lookup);
            return;
         }

         if (!lookup.found) {
            this.noInfoFound.set(true);
            return;
         }

         const titleMatches = lookup.title
            ? books.filter(book => this.normalizeTitle(book.title) === this.normalizeTitle(lookup.title ?? ''))
            : [];

         if (titleMatches.length > 0) {
            this.titleMatches.set(titleMatches);
            this.selectedTitleBookId.set(titleMatches[0].id);
            this.scanMode.set('choose-title');
            return;
         }

         this.openNewBook(lookup);
      } catch (error) {
         console.error('Failed to search book by ISBN:', error);
         this.searchError.set('Kunde inte hämta bokinformation just nu. Försök igen.');
      } finally {
         this.searching.set(false);
         this.searchIsbn.set('');
         this.focusSearchInput();
      }
   }

   useSelectedTitleBook() {
      const selectedBook = this.titleMatches().find(book => book.id === this.selectedTitleBookId());
      if (!selectedBook || !this.lookup()) {
         return;
      }

      this.openExistingBook(selectedBook, this.lookup()!);
   }

   createNewBookAnyway() {
      if (!this.lookup()) {
         return;
      }

      this.openNewBook(this.lookup()!);
   }

   openAuthorForm(authorName?: string) {
      const nextAuthorName = authorName ?? this.currentUnresolvedAuthor();
      if (!nextAuthorName) {
         return;
      }

      this.currentUnresolvedAuthor.set(nextAuthorName);
      this.authorFormIsOpen.set(true);
   }

   closeAuthorForm() {
      this.authorFormIsOpen.set(false);
   }

   async saveMissingAuthor(firstNameInput: HTMLInputElement, lastNameInput: HTMLInputElement) {
      const authorName = this.currentUnresolvedAuthor();
      if (!authorName) {
         return;
      }

      const parsedName = this.parseAuthorName(authorName);
      const firstName = firstNameInput.value.trim() || parsedName.firstName;
      const lastName = lastNameInput.value.trim() || parsedName.lastName;

      if (!firstName) {
         this.toast.error('Författaren behöver minst ett förnamn.');
         return;
      }

      const payload: AddAuthorDTO = {
         firstName,
         lastName: lastName || null,
         gender: null,
         birthYear: null,
         country: null,
         imageLink: null
      };

      this.savingAuthor.set(true);
      this.authorsService.addAuthor(payload)
         .pipe(
            this.toast.observe({
               loading: 'Lägger till författare...',
               success: (res) => {
                  const createdAuthor = res as Author;
                  void this.updateAuthorsList();
                  this.attachAuthorToBook(createdAuthor);
                  this.advanceAuthorQueue();
                  firstNameInput.value = '';
                  lastNameInput.value = '';
                  return `Lade till ${createdAuthor.firstName}${createdAuthor.lastName ? ' ' + createdAuthor.lastName : ''}!`;
               },
               error: (err) => {
                  if ((err as HttpErrorResponse).status === 409) {
                     return 'Denna författare finns redan.';
                  }

                  return `Något gick fel vid skapande av författare: ${(err as HttpErrorResponse).message}`;
               }
            })
         )
         .subscribe({
            complete: () => this.savingAuthor.set(false),
            error: () => this.savingAuthor.set(false)
         });
   }

   addCurrentBookToShelf() {
      const book = this.selectedBook();
      if (!book || this.currentBookInShelf()) {
         return;
      }

      this.booksService.addToShelf({ bookId: book.id, copies: 1 })
         .pipe(
            this.toast.observe({
               loading: 'Lägger till i bokhyllan...',
               success: (res) => {
                  this.currentBookInShelf.set(true);
                  return `Lade till ${(res as Book).title} i bokhyllan!`;
               },
               error: (err) => `Något gick fel vid tillägg i bokhyllan: ${(err as HttpErrorResponse).message}`
            })
         )
         .subscribe();
   }

   save() {
      this.formIsSubmitted = true;

      if (this.form.invalid) {
         this.toast.error('Formuläret är inte giltigt. Kontrollera att allt är rätt och försök igen.');
         return;
      }

      const rawValue = this.form.value;
      const authors = Array.isArray(rawValue.authors)
         ? rawValue.authors.filter((author: Author) => author && author.id != null)
         : [];

      if (this.selectedBook()) {
         const updatedBook = {
            ...this.selectedBook()!,
            title: rawValue.title,
            authors,
            yearWritten: this.toNumberOrNull(rawValue.yearWritten),
            genre: rawValue.genre,
            language: rawValue.language,
            originalLanguage: rawValue.originalLanguage,
            format: rawValue.format,
            isbn: this.toNumberOrNull(rawValue.isbn),
            coverLink: rawValue.coverLink,
            addedWithScanner: this.selectedBook()!.addedWithScanner,
            isDeleted: this.selectedBook()!.isDeleted,
            createdAt: this.selectedBook()!.createdAt,
            inShelf: this.currentBookInShelf()
         } as Book;

         this.saving.set(true);
         this.booksService.editBook(updatedBook)
            .pipe(
               this.toast.observe({
                  loading: 'Uppdaterar bok...',
                  success: (res) => {
                     this.selectedBook.set(res as Book);
                     this.currentBookInShelf.set(this.currentBookInShelf());
                     return `Uppdaterade ${(res as Book).title}!`;
                  },
                  error: (err) => `Något gick fel vid uppdatering av bok: ${(err as HttpErrorResponse).message}`
               })
            )
            .subscribe({
               complete: () => this.saving.set(false),
               error: () => this.saving.set(false)
            });
         return;
      }

      const newBook: AddBookDTO = {
         title: rawValue.title,
         authors: authors.map((author: Author) => author.id),
         yearWritten: this.toNumberOrNull(rawValue.yearWritten),
         genre: rawValue.genre ?? undefined,
         language: rawValue.language ?? undefined,
         originalLanguage: rawValue.originalLanguage ?? undefined,
         format: rawValue.format ?? undefined,
         isbn: this.toNumberOrNull(rawValue.isbn),
         coverLink: rawValue.coverLink ?? undefined,
         addedWithScanner: true
      };

      this.saving.set(true);
      this.booksService.addBook(newBook)
         .pipe(
            this.toast.observe({
               loading: 'Lägger till bok...',
               success: (res) => {
                  const createdBook = res as Book;
                  if (rawValue.addToShelf) {
                     this.booksService.addToShelf({ bookId: createdBook.id, copies: 1 }).subscribe();
                  }

                  return `Lade till ${createdBook.title}!`;
               },
               error: (err) => {
                  if ((err as HttpErrorResponse).status === 409) {
                     return 'Denna bok finns redan.';
                  }

                  return `Något gick fel vid skapande av bok: ${(err as HttpErrorResponse).message}`;
               }
            })
         )
         .subscribe({
            complete: () => this.saving.set(false),
            error: () => this.saving.set(false)
         });
   }

   getCurrentYear() {
      return new Date().getFullYear();
   }

   async updateAuthorsList() {
      this.allAuthors.set(await this.authorsService.getAllAuthors());
   }

   async updateGenresList() {
      this.allGenres.set(await this.genresService.getAllGenres());
   }

   async updateLanguagesList() {
      this.allLanguages.set(await this.languagesService.getAllLanguages());
   }

   get searchSummary() {
      if (this.selectedBook()) {
         return `Befintlig bok${this.currentBookInShelf() ? ' i bokhyllan' : ''}`;
      }

      if (this.scanMode() === 'new') {
         return 'Ny bok';
      }

      return 'Bokdata';
   }

   get coverPreview() {
      return this.form.get('coverLink')?.value || this.lookup()?.coverLink || null;
   }

   get pendingAuthorName() {
      return this.currentUnresolvedAuthor() ?? this.unresolvedAuthors()[0] ?? null;
   }

   private openExistingBook(book: Book, lookup: ISBNLookupResponse) {
      this.selectedBook.set(book);
      this.currentBookInShelf.set(Boolean(book.inShelf));
      this.scanMode.set('editing');
      this.titleMatches.set([]);
      this.selectedTitleBookId.set(null);
      this.form.patchValue(this.buildFormValues(book, lookup));
   }

   private openNewBook(lookup: ISBNLookupResponse) {
      this.selectedBook.set(null);
      this.currentBookInShelf.set(false);
      this.scanMode.set('new');
      this.titleMatches.set([]);
      this.selectedTitleBookId.set(null);
      this.form.patchValue(this.buildFormValues(null, lookup));
   }

   private buildFormValues(baseBook: Book | null, lookup: ISBNLookupResponse) {
      const isbn = baseBook?.isbn != null
         ? baseBook.isbn
         : this.toNumberOrNull(this.searchIsbn());

      return {
         title: baseBook?.title?.trim() ? baseBook.title : lookup.title ?? '',
         authors: baseBook?.authors?.length ? baseBook.authors : this.matchAuthors(lookup.authors),
         yearWritten: baseBook?.yearWritten ?? lookup.publishedYear ?? null,
         genre: baseBook?.genre?.id ?? this.matchGenreId(lookup.categories),
         language: baseBook?.language?.id ?? this.matchLanguageId(lookup.language),
         originalLanguage: baseBook?.originalLanguage?.id ?? this.matchLanguageId(lookup.language),
         format: baseBook?.format ?? null,
         isbn,
         coverLink: baseBook?.coverLink ?? lookup.coverLink ?? null,
         addToShelf: baseBook ? false : true
      };
   }

   private matchAuthors(apiAuthors: string[]) {
      const normalizedApiAuthors = apiAuthors.map(author => this.normalizeString(author));

      return this.allAuthors().filter(author => {
         const fullName = this.normalizeString(`${author.firstName} ${author.lastName}`);
         const reversedName = this.normalizeString(`${author.lastName}, ${author.firstName}`);
         return normalizedApiAuthors.includes(fullName) || normalizedApiAuthors.includes(reversedName);
      });
   }

   private collectUnresolvedAuthors(apiAuthors: string[]) {
      const localNames = this.allAuthors().map(author => this.normalizeString(`${author.firstName} ${author.lastName}`));

      return apiAuthors.filter(authorName => {
         const normalized = this.normalizeString(authorName);
         const parsed = this.parseAuthorName(authorName);
         const parsedFullName = this.normalizeString(`${parsed.firstName} ${parsed.lastName}`);
         return !localNames.includes(normalized) && !localNames.includes(parsedFullName);
      });
   }

   private updateAuthorQueue(authorNames: string[]) {
      this.unresolvedAuthors.set(authorNames);
      this.currentUnresolvedAuthor.set(authorNames[0] ?? null);
      this.authorFormIsOpen.set(authorNames.length > 0);
   }

   private advanceAuthorQueue() {
      const [, ...rest] = this.unresolvedAuthors();
      this.unresolvedAuthors.set(rest);
      this.currentUnresolvedAuthor.set(rest[0] ?? null);
      this.authorFormIsOpen.set(rest.length > 0);
   }

   private attachAuthorToBook(author: Author) {
      const currentAuthors = this.form.get('authors')?.value as Author[] | null;
      const nextAuthors = Array.isArray(currentAuthors) ? currentAuthors : [];

      if (!nextAuthors.some(existingAuthor => existingAuthor.id === author.id)) {
         this.form.patchValue({ authors: [...nextAuthors, author] });
      }
   }

   parseAuthorName(authorName: string) {
      const normalizedName = authorName.trim();

      if (normalizedName.includes(',')) {
         const [lastName, ...firstParts] = normalizedName.split(',').map(part => part.trim()).filter(Boolean);
         return {
            firstName: firstParts.join(' ') || lastName,
            lastName: firstParts.length ? lastName : null
         };
      }

      const parts = normalizedName.split(/\s+/).filter(Boolean);
      if (parts.length <= 1) {
         return { firstName: parts[0] ?? normalizedName, lastName: null };
      }

      return {
         firstName: parts.slice(0, -1).join(' '),
         lastName: parts.at(-1) ?? null
      };
   }

   private matchGenreId(categories: string[]) {
      const normalizedCategories = categories.map(category => this.normalizeString(category));
      return this.allGenres().find(genre => normalizedCategories.includes(this.normalizeString(genre.name)))?.id ?? null;
   }

   private matchLanguageId(language: string | null) {
      if (!language) {
         return null;
      }

      const normalizedLanguage = this.normalizeString(language);
      return this.allLanguages().find(item => this.normalizeString(item.name) === normalizedLanguage)?.id ?? null;
   }

   private normalizeIsbn(value: number | string | null | undefined) {
      return String(value ?? '').replace(/[^0-9]/g, '');
   }

   private normalizeTitle(value: string | null | undefined) {
      return this.normalizeString(value ?? '');
   }

   private normalizeString(value: string) {
      return value.toLocaleLowerCase().trim().replace(/\s+/g, ' ');
   }

   private toNumberOrNull(value: unknown) {
      if (value == null || value === '') {
         return null;
      }

      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
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

   private focusSearchInput() {
      const input = this.searchIsbnInput?.nativeElement;
      if (!input) {
         return;
      }

      input.focus();
      input.select();
   }
}