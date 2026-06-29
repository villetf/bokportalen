import { inject, Injectable } from '@angular/core';
import {
   Auth,
   createUserWithEmailAndPassword,
   signInWithEmailAndPassword,
   sendPasswordResetEmail,
   signOut,
   authState,
   User,
   sendEmailVerification,
   reload
} from '@angular/fire/auth';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
   providedIn: 'root',
})
export class AuthService {
   private auth: Auth = inject(Auth);
   user$: Observable<User | null> = authState(this.auth);
   emailVerified$ = this.user$.pipe(
      map(user => user?.emailVerified === true)
   );

   async registerAccount(email: string, password: string) {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      await sendEmailVerification(cred.user);
   }

   logInWithEmail(email: string, password: string) {
      return signInWithEmailAndPassword(this.auth, email, password);
   }

   logout() {
      return signOut(this.auth);
   }

   resetPassword(email: string) {
      return sendPasswordResetEmail(this.auth, email, {
         url: environment.passwordResetRedirect
      });
   }

   sendVerificationEmail() {
      const user = this.auth.currentUser;
      if (!user) {
         return Promise.reject(new Error('Ingen användare är inloggad.'));
      }
      return sendEmailVerification(user);
   }

   refreshUser() {
      const user = this.auth.currentUser;
      if (!user) {
         return Promise.reject(new Error('Ingen användare är inloggad.'));
      }
      return reload(user);
   }
}