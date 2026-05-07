import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { UserStore } from '../stores/user.store';
import { firstValueFrom } from 'rxjs';
import { AppUser } from '../types/AppUser.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })

export class AuthSyncService {

   constructor(

      private auth: Auth,

      private http: HttpClient,

      private userStore: UserStore

   ) {
      this.init();
   }

   private init() {
      onAuthStateChanged(this.auth, async(firebaseUser) => {
         if (!firebaseUser) {
            this.userStore.clear();
            return;
         }

         this.userStore.setLoading();
         try {
            const token = await firebaseUser.getIdToken();

            const user = await firstValueFrom(
               this.http.get<AppUser>(`${environment.apiUrl}/users/me`, {
                  headers: {
                     Authorization: `Bearer ${token}`
                  }
               })
            );

            this.userStore.setUser(user);
         } catch (error) {
            console.error('Failed to sync authenticated user.', error);
            this.userStore.clear();
         }
      });
   }
}