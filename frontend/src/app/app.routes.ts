import { Routes } from '@angular/router';
import { HomePage } from './features/home/pages/home-page/home-page';
import { AllBooks } from './features/books/pages/all-books/all-books';
import { BookPage } from './features/books/pages/book-page/book-page';
import { AuthorPage } from './features/authors/pages/author-page/author-page';
import { AddView } from './shared/pages/add-view/add-view';

export const routes: Routes = [
   { path: '', component: HomePage },
   { path: 'books', component: AllBooks },
   { path: 'books/:id', component: BookPage },
   { path: 'authors/:id', component: AuthorPage },
   { path: 'add', component: AddView }
];
