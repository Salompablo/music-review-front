import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { AuthRequest } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss',
})
export class SigninComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private configService = inject(ConfigService);

  darkMode = signal(false);
  showPassword = signal(false);
  isSubmitting = signal(false);
  signinError = signal<string | null>(null);

  signinForm: FormGroup;
  private themeSubscription?: Subscription;

  constructor() {
    this.signinForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.themeSubscription = this.themeService.darkMode$.subscribe(
      isDarkMode => {
        this.darkMode.set(isDarkMode);
      }
    );
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      emailOrUsername: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
  }

  // ============ Validation methods ============

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signinForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string | null {
    const field = this.signinForm.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return null;
    }

    const errors = field.errors;

    if (errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }

    if (errors['email']) {
      return 'Enter a valid email';
    }

    return 'Invalid field';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      emailOrUsername: 'Email or username',
      password: 'Password',
    };

    return displayNames[fieldName] || fieldName;
  }

  // ============ UI methods ============

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  clearError(): void {
    this.signinError.set(null);
  }

  hasError(): boolean {
    return !!this.signinError();
  }

  // ============ Form submission method ============

  onSubmit(): void {
    if (this.signinForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      this.signinError.set(null);

      const loginData: AuthRequest = {
        emailOrUsername: this.signinForm.value.emailOrUsername.trim(),
        password: this.signinForm.value.password,
      };

      this.authService.login(loginData).subscribe({
        next: response => {
          this.configService.logSecure('Login successful');
          this.isSubmitting.set(false);

          if (this.signinForm.value.rememberMe) {
            // TODO: Implement remember me functionality
            this.configService.log('Remember me activated');
          }

          this.router.navigate(['/dashboard']);
        },
        error: error => {
          this.configService.logError('Login failed', error);
          this.isSubmitting.set(false);

          if (error.includes('401') || error.includes('Unauthorized')) {
            this.signinError.set(
              'Invalid credentials. Please check your email/username and password-'
            );
          } else if (error.includes('404')) {
            this.signinError.set('User not found.');
          } else if (error.includes('500')) {
            this.signinError.set('Server error. Please try again later.');
          } else {
            this.signinError.set('Login error. Please try again.');
          }
        },
      });
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.signinForm.controls).forEach(key => {
      this.signinForm.get(key)?.markAsTouched();
    });
  }

  // ============ Navigation methods ============

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  // ============ Template methods ============

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
