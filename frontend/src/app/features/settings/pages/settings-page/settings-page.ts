import { Component, computed, effect, signal } from '@angular/core';
import { UserStore } from '../../../../stores/user.store';
import { UsersService } from '../../../../services/usersService';

@Component({
   selector: 'app-settings-page',
   standalone: true,
   templateUrl: './settings-page.html'
})
export class SettingsPage {
   protected user = computed(() => this.userStore.user());
   protected coverDisplayMode = signal<'natural' | 'uniform'>('natural');
   protected saving = signal(false);
   protected errorMsg = signal('');

   constructor(
      private userStore: UserStore,
      private usersService: UsersService
   ) {
      effect(() => {
         const currentUser = this.userStore.user();

         if (!currentUser) {
            return;
         }

         this.coverDisplayMode.set(currentUser.showRealCovers ? 'natural' : 'uniform');
      });
   }

   get canSubmit() {
      const currentUser = this.user();
      if (!currentUser || this.saving()) {
         return false;
      }
      const currentMode = currentUser.showRealCovers ? 'natural' : 'uniform';
      return this.coverDisplayMode() !== currentMode;
   }

   async saveSettings() {
      if (!this.canSubmit) {
         return;
      }

      this.errorMsg.set('');
      this.saving.set(true);

      try {
         const showRealCovers = this.coverDisplayMode() === 'natural';
         const updatedUser = await this.usersService.updateCurrentUserSettings({ showRealCovers });
         this.userStore.setUser(updatedUser);
      } catch (error: any) {
         console.error('Failed to save user settings:', error);
         this.errorMsg.set('Kunde inte spara inställningarna. Försök igen.');
      } finally {
         this.saving.set(false);
      }
   }
}