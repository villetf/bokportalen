import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, authState, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
   providedIn: 'root',
})
export class AuthService {
   private auth: Auth = inject(Auth);
   user$: Observable<User | null> = authState(this.auth);

   registerAccount(email: string, password: string) {
      return createUserWithEmailAndPassword(this.auth, email, password);
   }
}