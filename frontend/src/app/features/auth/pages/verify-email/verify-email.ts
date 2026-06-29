import { Component, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/authService';
import { firstValueFrom, Observable } from 'rxjs';
import { User } from '@angular/fire/auth';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
   selector: 'app-verify-email',
   standalone: true,
   imports: [AsyncPipe],
   templateUrl: './verify-email.html',
   styles: '',
})
export class VerifyEmail {
   loading = signal<boolean>(false);
   errorMsg = signal<string>('');
   successMsg = signal<string>('');
   user$!: Observable<User | null>;
   emailVerified$!: Observable<boolean>;


   constructor(private auth: AuthService, private router: Router, private toast: HotToastService) {
      this.user$ = this.auth.user$;
      this.emailVerified$ = this.auth.emailVerified$;
   }

   ngOnInit() {
      firstValueFrom(this.user$).then(user => {
         if (!user) {
            this.router.navigate(['/login']);
         }
      });
   }

   async sendVerificationEmail() {
      this.errorMsg.set('');
      this.successMsg.set('');
      this.loading.set(true);
      try {
         await this.auth.sendVerificationEmail();
         this.successMsg.set('Verifieringsmail skickat. Kontrollera din e-post.');
      } catch (err: any) {
         const msg = typeof err?.message === 'string' ? err.message : 'Kunde inte skicka verifieringsmail.';
         this.errorMsg.set(msg);
      } finally {
         this.loading.set(false);
      }
   }

   async refreshUser() {
      this.errorMsg.set('');
      this.successMsg.set('');
      this.loading.set(true);
      try {
         await this.auth.refreshUser();
         const verified = await firstValueFrom(this.auth.emailVerified$);
         if (verified) {
            this.toast.success('Din e-postadress har verifierats!');
            await this.router.navigate(['/books']);
         }
      } catch (err: any) {
         const msg = typeof err?.message === 'string' ? err.message : 'Kunde inte uppdatera kontot.';
         this.errorMsg.set(msg);
      } finally {
         this.loading.set(false);
      }
   }
}
