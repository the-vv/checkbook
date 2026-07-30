import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule, MessageModule],
  template: `
    <div class="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="flex items-center justify-center gap-2 mb-3">
            <i class="pi pi-check-square text-violet-400 text-4xl"></i>
            <h1 class="text-3xl font-bold text-white">Checkbook</h1>
          </div>
          <p class="text-slate-400">Create an account to get started</p>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 class="text-xl font-semibold text-white mb-6">Create account</h2>

          @if (error) {
            <p-message severity="error" [text]="error" styleClass="w-full mb-4" />
          }

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <div class="flex flex-col gap-1">
              <label class="text-slate-300 text-sm font-medium">Full Name</label>
              <input pInputText formControlName="name" placeholder="John Doe"
                class="w-full bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-slate-300 text-sm font-medium">Email</label>
              <input pInputText formControlName="email" type="email" placeholder="you@example.com"
                class="w-full bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-slate-300 text-sm font-medium">Password</label>
              <p-password formControlName="password" [toggleMask]="true"
                placeholder="Min. 6 characters" styleClass="w-full"
                inputStyleClass="w-full bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
            </div>

            <p-button type="submit" label="Create Account" icon="pi pi-user-plus" styleClass="w-full"
              [loading]="loading" severity="secondary" />
          </form>

          <p class="text-center text-slate-400 text-sm mt-6">
            Already have an account?
            <a routerLink="/auth/login" class="text-violet-400 hover:text-violet-300 font-medium ml-1">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { name, email, password } = this.form.value;
    this.auth.signup(name!, email!, password!).subscribe({
      next: () => this.router.navigate(['/templates']),
      error: (e) => {
        this.error = e.error?.message || 'Registration failed';
        this.loading = false;
      },
    });
  }
}
