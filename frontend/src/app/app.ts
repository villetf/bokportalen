import { Component, signal } from '@angular/core';
import { Header } from './features/header/components/header/header';
import { MainContent } from './shared/components/main-content/main-content';
import { AuthSyncService } from './services/authSyncService';

@Component({
   selector: 'app-root',
   imports: [Header, MainContent],
   templateUrl: './app.html',
   styleUrl: './app.css'
})
export class App {
   protected readonly title = signal('bokportalen');

   constructor(private authSync: AuthSyncService) {}
}
