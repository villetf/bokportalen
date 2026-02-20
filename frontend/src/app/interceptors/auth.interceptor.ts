import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
   constructor(private auth: Auth) {}

   intercept(req: HttpRequest<any>, next: HttpHandler) {
      const user = this.auth.currentUser;

      if (!user) {
         return next.handle(req);
      }

      return from(user.getIdToken()).pipe(
         switchMap(token => {
            const authReq = req.clone({
               setHeaders: {
                  Authorization: `Bearer ${token}`,
               },
            });
            return next.handle(authReq);
         })
      );
   }
}