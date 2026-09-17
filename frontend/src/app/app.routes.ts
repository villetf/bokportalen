import { Routes } from '@angular/router';
import { AllBooks } from './features/books/pages/all-books/all-books';
import { ArchiveBooks } from './features/books/pages/archive-books/archive-books';
import { BookPage } from './features/books/pages/book-page/book-page';
import { AuthorPage } from './features/authors/pages/author-page/author-page';
import { AddView } from './shared/pages/add-view/add-view';
import { DeletedBooks } from './features/books/pages/deleted-books/deleted-books';
import { AuthGuard } from './auth.guard';
import { Register } from './features/auth/pages/register/register';
import { LogIn } from './features/auth/pages/log-in/log-in';
import { ResetPassword } from './features/auth/pages/reset-password/reset-password';
import { VerifyEmail } from './features/auth/pages/verify-email/verify-email';
import { SettingsPage } from './features/settings/pages/settings-page/settings-page';
import { ScanPage } from './features/scan/pages/scan-page/scan-page';

export const routes: Routes = [
   // { path: '', component: HomePage },
   { path: '', pathMatch: 'full', redirectTo: 'books' },
   { path: 'books', data: { headerTitle: 'Min bokhylla' }, component: AllBooks, canActivate: [AuthGuard] },
   { path: 'books/archive', data: { headerTitle: 'Bokarkiv' }, component: ArchiveBooks, canActivate: [AuthGuard] },
   { path: 'books/deleted', data: { headerTitle: 'Raderade böcker' }, component: DeletedBooks, canActivate: [AuthGuard] },
   { path: 'books/:id', data: { headerTitle: 'Bok' }, component: BookPage, canActivate: [AuthGuard] },
   { path: 'authors/:id', data: { headerTitle: 'Författare' }, component: AuthorPage, canActivate: [AuthGuard] },
   { path: 'add', data: { headerTitle: 'Lägg till' }, component: AddView, canActivate: [AuthGuard] },
   { path: 'register', data: { headerTitle: 'Skapa konto' }, component: Register},
   { path: 'login', data: { headerTitle: 'Logga in' }, component: LogIn },
   { path: 'reset-password', data: { headerTitle: 'Återställ lösenord' }, component: ResetPassword},
   { path: 'register/verify-email', data: { headerTitle: 'Verifiera e-post' }, component: VerifyEmail },
   { path: 'settings', data: { headerTitle: 'Inställningar' }, component: SettingsPage, canActivate: [AuthGuard] },
   { path: 'profile', pathMatch: 'full', redirectTo: 'settings' },
   { path: 'scan', data: { headerTitle: 'Skanna' }, component: ScanPage, canActivate: [AuthGuard] }
];
