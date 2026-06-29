import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../../services/authService';

@Component({
   selector: 'app-log-in',
   standalone: true,
   imports: [CommonModule, RouterModule, ReactiveFormsModule],
   templateUrl: './log-in.html',
   styles: '',
})
export class LogIn {
   loading = signal<boolean>(false);
   errorMsg = signal<string>('');
   form!: FormGroup;


   constructor(private auth: AuthService, private router: Router, private fb: FormBuilder) {}

   ngOnInit() {
      this.form = this.fb.nonNullable.group({
         email: ['', [Validators.required, Validators.email]],
         password: ['', [Validators.required, Validators.minLength(6)]],
      });
   }

   get canSubmit() {
      return this.form.valid && !this.loading();
   }

   async login() {
      if (!this.canSubmit) {
         return;
      }
      this.errorMsg.set('');
      this.loading.set(true);
      try {
         const email = this.form.value.email;
         const password = this.form.value.password;
         await this.auth.logInWithEmail(email, password);
         await this.router.navigate(['/books']);
      } catch (err: any) {
         let msg = '';
         if (err.code === 'auth/invalid-credential') {
            msg = 'Felaktigt användarnamn eller lösenord.';
         } else {
            msg = typeof err?.message === 'string' ? err.message : 'Kunde inte logga in.';
         }
         this.errorMsg.set(msg);
      } finally {
         this.loading.set(false);
      }
   }
}
