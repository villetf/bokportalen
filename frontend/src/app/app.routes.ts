import { Routes } from '@angular/router';
import { HomePage } from './features/home/pages/home-page/home-page';
import { AllBooks } from './features/books/pages/all-books/all-books';

export const routes: Routes = [
   { path: '', component: HomePage },
   { path: 'books', component: AllBooks }
];
