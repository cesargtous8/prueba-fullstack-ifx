import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="logo">VM Manager</div>
        <h1>IFX Networks</h1>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Enter your email"
            />
            <div class="error" *ngIf="getControl('email')?.invalid && getControl('email')?.touched">
              <span *ngIf="getControl('email')?.errors?.['required']">Email is required</span>
              <span *ngIf="getControl('email')?.errors?.['email']">Invalid email format</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter your password"
            />
            <div class="error" *ngIf="getControl('password')?.invalid && getControl('password')?.touched">
              <span *ngIf="getControl('password')?.errors?.['required']">Password is required</span>
              <span *ngIf="getControl('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <button
            type="submit"
            class="btn-submit"
            [disabled]="!form.valid || isSubmitting"
          >
            {{ isSubmitting ? 'Logging in...' : 'Sign In' }}
          </button>

          <div class="error-global" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    .login-card {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 420px;
    }

    .logo {
      font-size: 2.5rem;
      font-weight: bold;
      color: #667eea;
      text-align: center;
      margin-bottom: 0.5rem;
    }

    h1 {
      text-align: center;
      color: #666;
      font-size: 1rem;
      font-weight: 400;
      margin: 0 0 2rem;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 600;
      font-size: 0.875rem;
    }

    input {
      width: 100%;
      padding: 0.875rem;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
      transition: border-color 0.3s, box-shadow 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .error {
      color: #e74c3c;
      font-size: 0.75rem;
      margin-top: 0.375rem;
      line-height: 1.4;
    }

    .btn-submit {
      width: 100%;
      padding: 0.875rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s, transform 0.2s;
      margin-bottom: 1.5rem;
    }

    .btn-submit:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-global {
      background: #fadbd8;
      color: #c0392b;
      padding: 1rem;
      border-radius: 6px;
      text-align: center;
      margin-bottom: 1rem;
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMessage = '';
  isSubmitting = false;

  getControl(name: string) {
    return this.form.get(name);
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.errorMessage = '';
    this.isSubmitting = true;
    const { email, password } = this.form.getRawValue();

    this.auth.login({
      email: email ?? '',
      password: password ?? ''
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: { status?: number; error?: { message?: string } }) => {
        this.isSubmitting = false;

        if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor (API caída o CORS).';
        } else if (err.status === 401) {
          this.errorMessage = 'Credenciales inválidas.';
        } else {
          this.errorMessage = err.error?.message ?? 'Error inesperado al iniciar sesión.';
        }
      }
    });
  }
}