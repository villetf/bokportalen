import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, ValidatorFn, AbstractControl, FormGroup } from '@angular/forms';
import { AuthService } from '../../../../services/authService';

@Component({
   selector: 'app-register',
   standalone: true,
   imports: [CommonModule, RouterModule, ReactiveFormsModule],
   templateUrl: './register.html',
   styles: '',
})
export class Register {
   loading = false;
   errorMsg = '';
   form!: FormGroup;

   constructor(private auth: AuthService, private router: Router, private fb: FormBuilder) {}

   ngOnInit() {
      this.form = this.fb.nonNullable.group(
         {
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
         },
         { validators: this.passwordsMatchValidator }
      );
   }


   private passwordsMatchValidator: ValidatorFn = (group: AbstractControl) => {
      const password = group.get('password')?.value;
      const confirm = group.get('confirmPassword')?.value;
      return password === confirm ? null : { passwordMismatch: true };
   };

   get canSubmit() {
      return this.form.valid && !this.loading;
   }

   async register() {
      if (!this.canSubmit) {
         return;
      }
      this.errorMsg = '';
      this.loading = true;
      try {
         const email = this.form.value.email;
         const password = this.form.value.password;
         await this.auth.registerAccount(email, password);
         await this.router.navigate(['/books']);
      } catch (err: any) {
         const msg = typeof err?.message === 'string' ? err.message : 'Kunde inte skapa konto.';
         this.errorMsg = msg;
      } finally {
         this.loading = false;
      }
   }
}
