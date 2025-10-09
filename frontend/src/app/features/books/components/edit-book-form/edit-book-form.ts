import { Component, Input, signal } from '@angular/core';
import { ArrayInput } from "../../../../shared/components/array-input/array-input";
import { Book } from '../../../../types/Book.model';
import { Author } from '../../../../types/Author.model';
import { AuthorsService } from '../../../../services/authorsService';
import { Genre } from '../../../../types/Genre.model';
import { GenresService } from '../../../../services/genresService';

@Component({
  selector: 'app-edit-book-form',
  imports: [ArrayInput],
  templateUrl: './edit-book-form.html',
  styles: ``
})
export class EditBookForm {
   @Input() book!: Book;
   allAuthors = signal<Author[]>([]);
   editedBook = signal<Book | null>(null);
   allGenres = signal<Genre[]>([])
   

   displayAuthor = (author: Author) => `${author.firstName} ${author.lastName}`;

   constructor(private authorsService: AuthorsService, private genresService: GenresService) {}

   ngOnInit(): void {
      this.authorsService.getAllAuthors().then(authors => {
         this.allAuthors.set(authors);
      });

      this.genresService.getAllGenres().then(genres => {
         this.allGenres.set(genres);
      })

      this.editedBook.set(structuredClone(this.book));
   }
}
