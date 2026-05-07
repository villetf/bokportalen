import { Injectable, signal } from '@angular/core';
import { AppUser } from '../types/AppUser.model';

@Injectable({ providedIn: 'root' })
export class UserStore {
   private _user = signal<AppUser | null>(null);
   private _loading = signal<boolean>(false);

   setUser(user: AppUser) {
      this._user.set(user);
      this._loading.set(false);
   }

   clear() {
      this._user.set(null);
      this._loading.set(false);
   }

   setLoading() {
      this._loading.set(true);
   }

}