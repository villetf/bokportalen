import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppUser } from '../types/AppUser.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
   constructor(private http: HttpClient, private auth: Auth) {}

   async updateCurrentUserSettings(showRealCovers: boolean): Promise<AppUser> {
      const currentUser = this.auth.currentUser;

      if (!currentUser) {
         throw new Error('Ingen användare är inloggad.');
      }

      const token = await currentUser.getIdToken();

      return firstValueFrom(
         this.http.patch<AppUser>(
            `${environment.apiUrl}/users/me`,
            { showRealCovers },
            {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            }
         )
      );
   }
}