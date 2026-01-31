import { Routes } from '@angular/router';
import { AllBooks } from './features/books/pages/all-books/all-books';
import { BookPage } from './features/books/pages/book-page/book-page';
import { AuthorPage } from './features/authors/pages/author-page/author-page';
import { AddView } from './shared/pages/add-view/add-view';
import { DeletedBooks } from './features/books/pages/deleted-books/deleted-books';
import { AuthGuard } from './auth.guard';
import { Register } from './features/auth/pages/register/register';
import { LogIn } from './features/auth/pages/log-in/log-in';

export const routes: Routes = [
   // { path: '', component: HomePage },
   { path: '', pathMatch: 'full', redirectTo: 'books' },
   { path: 'books', component: AllBooks, canActivate: [AuthGuard] },
   { path: 'books/deleted', component: DeletedBooks, canActivate: [AuthGuard] },
   { path: 'books/:id', component: BookPage, canActivate: [AuthGuard] },
   { path: 'authors/:id', component: AuthorPage, canActivate: [AuthGuard] },
   { path: 'add', component: AddView, canActivate: [AuthGuard] },
   { path: 'register', component: Register},
   { path: 'login', component: LogIn }
];
