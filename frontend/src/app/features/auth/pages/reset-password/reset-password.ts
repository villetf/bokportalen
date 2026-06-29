import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../../services/authService';

@Component({
   selector: 'app-reset-password',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule],
   templateUrl: './reset-password.html',
   styles: '',
})
export class ResetPassword {
   loading = signal<boolean>(false);
   errorMsg = signal<string>('');
   successMsg = signal<string>('');
   form!: FormGroup;


   constructor(private auth: AuthService, private fb: FormBuilder) {}

   ngOnInit() {
      this.form = this.fb.nonNullable.group({
         email: ['', [Validators.required, Validators.email]],
      });
   }

   get canSubmit() {
      return this.form.valid && !this.loading();
   }

   async sendResetLink() {
      if (!this.canSubmit) {
         return;
      }
      this.errorMsg.set('');
      this.successMsg.set('');
      this.loading.set(true);
      try {
         const email = this.form.value.email;
         await this.auth.resetPassword(email);
         this.successMsg.set('Återställningslänk skickad. Om kontot finns kommer du få ett mail från noreply@bokportalen.firebaseapp.com. Om du inte hittar det, kontrollera skräpposten.');
      } catch (err: any) {
         let msg = '';
         if (err.code === 'auth/invalid-email') {
            msg = 'E-postadressen är inte giltig.';
         } else {
            msg = typeof err?.message === 'string' ? err.message : 'Kunde inte skicka återställningslänk.';
         }
         this.errorMsg.set(msg);
      } finally {
         this.loading.set(false);
      }
   }
}
