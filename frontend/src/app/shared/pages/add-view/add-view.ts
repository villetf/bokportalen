import { Component, signal } from '@angular/core';
import { AddBook } from '../../../features/books/components/add-book/add-book';
import { AddAuthor } from '../../../features/authors/components/add-author/add-author';
import { AddGenre } from '../../../features/genres/components/add-genre/add-genre';
import { AddLanguage } from '../../../features/languages/components/add-language/add-language';

@Component({
   selector: 'app-add-view',
   imports: [AddBook, AddAuthor, AddGenre, AddLanguage],
   templateUrl: './add-view.html',
   styles: ''
})
export class AddView {
   selectedView = signal<string>('book');
}
