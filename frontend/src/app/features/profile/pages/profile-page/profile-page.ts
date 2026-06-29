import { Component, effect, signal } from '@angular/core';
import { UserStore } from '../../../../stores/user.store';
import { UsersService } from '../../../../services/usersService';

@Component({
   selector: 'app-profile-page',
   standalone: true,
   templateUrl: './profile-page.html'
})
export class ProfilePage {
   protected firstName = signal('');
   protected lastName = signal('');
   protected saving = signal(false);
   protected errorMsg = signal('');

   constructor(private userStore: UserStore, private usersService: UsersService) {
      effect(() => {
         const u = this.userStore.user();
         if (!u) {
            return;
         }
         this.firstName.set(u.firstName ?? '');
         this.lastName.set(u.lastName ?? '');
      });
   }

   get canSubmit() {
      const u = this.userStore.user();
      if (!u || this.saving()) {
         return false;
      }
      return this.firstName() !== (u.firstName ?? '') || this.lastName() !== (u.lastName ?? '');
   }

   async save() {
      if (!this.canSubmit) {
         return;
      }
      this.errorMsg.set('');
      this.saving.set(true);
      try {
         const updated = await this.usersService.updateCurrentUserSettings({ firstName: this.firstName() || null, lastName: this.lastName() || null });
         this.userStore.setUser(updated);
      } catch (err: any) {
         console.error(err);
         this.errorMsg.set('Kunde inte spara profilen. Försök igen.');
      } finally {
         this.saving.set(false);
      }
   }
}