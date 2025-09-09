import { Component, signal } from '@angular/core';
import { Author } from '../../../../types/Author.model';
import { ActivatedRoute } from '@angular/router';
import { AuthorsService } from '../../../../services/authorsService';
import { Book } from '../../../../types/Book.model';
import { BooksService } from '../../../../services/booksService';
import { BookCard } from "../../../books/components/book-card/book-card";

@Component({
  selector: 'app-author-page',
  imports: [BookCard],
  templateUrl: './author-page.html',
  styles: ``
})
export class AuthorPage {
   author = signal<Author | null>(null);
   booksByAuthor = signal<Book[]>([]);

   constructor(
      private route: ActivatedRoute, 
      private authorService: AuthorsService, 
      private booksService: BooksService
   ) {}

   async ngOnInit() {
      const authorId = this.route.snapshot.paramMap.get('id');
      if (authorId) {
         this.author.set(await this.authorService.getAuthorById(Number.parseInt(authorId)));
      }

      const books = this.booksService.getBooksByAuthor(this.author()!.id);

      books.subscribe(value => {
         value.forEach(book => {
            this.booksByAuthor.set([...this.booksByAuthor(), book])
         });
      });
   }
}

