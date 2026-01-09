import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Author } from '../../../../types/Author.model';
import { ActivatedRoute } from '@angular/router';
import { AuthorsService } from '../../../../services/authorsService';
import { Book } from '../../../../types/Book.model';
import { BooksService } from '../../../../services/booksService';
import { BookCard } from '../../../books/components/book-card/book-card';
import { EditPanel } from '../../../../shared/components/edit-panel/edit-panel';
import { EditBookForm } from '../../components/edit-author-form/edit-author-form';
import { Button } from '../../../../shared/components/button/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
   selector: 'app-author-page',
   imports: [BookCard, EditPanel, Button, EditBookForm],
   templateUrl: './author-page.html',
   styles: ''
})
export class AuthorPage {
   author = signal<Author | null>(null);
   booksByAuthor = signal<Book[]>([]);
   editViewIsOpen = signal<boolean>(false);
   private destroyRef = inject(DestroyRef);

   constructor(
      private route: ActivatedRoute,
      private authorService: AuthorsService,
      private booksService: BooksService
   ) {}

   ngOnInit() {
      this.route.paramMap
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(async params => {
            const authorId = params.get('id');
            if (authorId) {
               this.author.set(await this.authorService.getAuthorById(Number.parseInt(authorId)));
               this.updateBooksByAuthor();
            } else {
               this.author.set(null);
               this.booksByAuthor.set([]);
            }
         });
   }

   openEditView() {
      this.editViewIsOpen.set(true);
   }

   closeEditView = () => {
      this.editViewIsOpen.set(false);
   };

   updateAuthor = (updatedAuthor: Author) => {
      this.author.set(updatedAuthor);
      this.updateBooksByAuthor();
   };

   updateBooksByAuthor() {
      this.booksByAuthor.set([]);
      this.booksService.getBooksByAuthor(this.author()!.id)
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(value => {
            value.forEach(book => {
               this.booksByAuthor.set([...this.booksByAuthor(), book]);
            });
         });
   }
}

