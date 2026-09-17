import { Component, computed, effect, signal } from '@angular/core';
import { UserStore } from '../../../../stores/user.store';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/authService';
import { UsersService } from '../../../../services/usersService';

@Component({
   selector: 'app-settings-page',
   standalone: true,
   templateUrl: './settings-page.html'
})
export class SettingsPage {
   protected user = computed(() => this.userStore.user());
   protected coverDisplayMode = signal<'natural' | 'uniform'>('natural');
   protected firstName = signal('');
   protected lastName = signal('');
   protected loggingOut = signal(false);
   protected logoutError = signal('');
   protected saving = signal(false);
   protected errorMsg = signal('');

   constructor(
      private userStore: UserStore,
      private usersService: UsersService,
      private auth: AuthService,
      private router: Router
   ) {
      effect(() => {
         const currentUser = this.userStore.user();

         if (!currentUser) {
            return;
         }

         this.firstName.set(currentUser.firstName ?? '');
         this.lastName.set(currentUser.lastName ?? '');
         this.coverDisplayMode.set(currentUser.showRealCovers ? 'natural' : 'uniform');
      });
   }

   get canSubmit() {
      const currentUser = this.user();
      if (!currentUser || this.saving() || this.loggingOut()) {
         return false;
      }
      const currentMode = currentUser.showRealCovers ? 'natural' : 'uniform';
      return this.coverDisplayMode() !== currentMode
         || this.firstName() !== (currentUser.firstName ?? '')
         || this.lastName() !== (currentUser.lastName ?? '');
   }

   async saveSettings() {
      if (!this.canSubmit) {
         return;
      }

      this.errorMsg.set('');
      this.saving.set(true);

      try {
         const showRealCovers = this.coverDisplayMode() === 'natural';
         const updatedUser = await this.usersService.updateCurrentUserSettings({
            showRealCovers,
            firstName: this.firstName() || null,
            lastName: this.lastName() || null,
         });
         this.userStore.setUser(updatedUser);
      } catch (error: any) {
         console.error('Failed to save user settings:', error);
         this.errorMsg.set('Kunde inte spara inställningarna. Försök igen.');
      } finally {
         this.saving.set(false);
      }
   }

   async logout() {
      if (this.loggingOut() || this.saving()) return;

      this.logoutError.set('');
      this.loggingOut.set(true);
      try {
         await this.auth.logout();
         await this.router.navigate(['/login']);
      } catch (error) {
         console.error('Logout failed:', error);
         this.logoutError.set('Utloggning misslyckades. Försök igen.');
      } finally {
         this.loggingOut.set(false);
      }
   }
}
