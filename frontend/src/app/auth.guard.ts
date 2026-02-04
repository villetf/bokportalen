import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { take, map } from 'rxjs';
import { AuthService } from './services/authService';

@Injectable({
   providedIn: 'root',
})
export class AuthGuard implements CanActivate {
   constructor(private authService: AuthService, private router: Router) {}

   canActivate() {
      return this.authService.user$.pipe(
         take(1),
         map(user => {
            if (!user) {
               this.router.navigate(['/login']);
               return false;
            }

            if (!user.emailVerified) {
               this.router.navigate(['/register/verify-email']);
               return false;
            }

            return true;
         })
      );
   }
}