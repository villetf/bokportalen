import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs';
import { AuthService } from './services/authService';

@Injectable({
   providedIn: 'root',
})
export class AuthGuard implements CanActivate {
   constructor(private authService: AuthService, private router: Router) {}

   canActivate(): Observable<boolean | UrlTree> {
      return this.authService.user$.pipe(
         take(1),
         map(user => {
            if (!user) {
               return this.router.createUrlTree(['/login']);
            }

            if (!user.emailVerified) {
               return this.router.createUrlTree(['/register/verify-email']);
            }

            return true;
         })
      );
   }
}