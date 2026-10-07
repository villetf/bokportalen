import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Author } from '../../../../types/Author.model';
import { ActivatedRoute } from '@angular/router';
import { AuthorsService } from '../../../../services/authorsService';
import { UserBook } from '../../../../types/UserBook.model';
import { Book } from '../../../../types/Book.model';
import { BooksService } from '../../../../services/booksService';
import { BookCard } from '../../../books/components/book-card/book-card';
import { EditPanel } from '../../../../shared/components/edit-panel/edit-panel';
import { EditBookForm } from '../../components/edit-author-form/edit-author-form';
import { Button } from '../../../../shared/components/button/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, from, of, combineLatest, take } from 'rxjs';

@Component({
   selector: 'app-author-page',
   imports: [BookCard, EditPanel, Button, EditBookForm],
   templateUrl: './author-page.html',
   styles: ''
})
export class AuthorPage {
   author = signal<Author | null>(null);
   shelfBooksByAuthor = signal<UserBook[]>([]);
   archiveBooksByAuthor = signal<Book[]>([]);
   editViewIsOpen = signal<boolean>(false);
   private destroyRef = inject(DestroyRef);

   constructor(
      private route: ActivatedRoute,
      private authorService: AuthorsService,
      private booksService: BooksService
   ) {}

   ngOnInit() {
      this.route.paramMap
         .pipe(
            takeUntilDestroyed(this.destroyRef),
            switchMap(params => {
               const authorId = params.get('id');
               if (authorId) {
                  return from(this.authorService.getAuthorById(Number.parseInt(authorId, 10)));
               }
               return of(null);
            })
         )
         .subscribe(author => {
            this.author.set(author);
            if (author) {
               this.updateBooksByAuthor();
            } else {
               this.shelfBooksByAuthor.set([]);
               this.archiveBooksByAuthor.set([]);
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
      const author = this.author();
      if (!author) {
         this.shelfBooksByAuthor.set([]);
         this.archiveBooksByAuthor.set([]);
         return;
      }

      combineLatest([
         this.booksService.getShelfBooksByAuthor(author.id),
         this.booksService.getAllBooksByAuthor(author.id)
      ])
         .pipe(take(1), takeUntilDestroyed(this.destroyRef))
         .subscribe(([shelfBooks, archiveBooks]) => {
            this.shelfBooksByAuthor.set(shelfBooks);
            this.archiveBooksByAuthor.set(archiveBooks);
         });
   }
}
