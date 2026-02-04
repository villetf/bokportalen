import { inject, Injectable } from '@angular/core';
import {
   Auth,
   createUserWithEmailAndPassword,
   signInWithEmailAndPassword,
   sendPasswordResetEmail,
   signOut,
   authState,
   User
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
   providedIn: 'root',
})
export class AuthService {
   private auth: Auth = inject(Auth);
   user$: Observable<User | null> = authState(this.auth);

   registerAccount(email: string, password: string) {
      return createUserWithEmailAndPassword(this.auth, email, password);
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
}