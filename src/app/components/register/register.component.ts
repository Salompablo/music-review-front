import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { SignupRequest } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private configService = inject(ConfigService);

  darkMode = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  registerForm: FormGroup;
  private themeSubscription?: Subscription;

  constructor() {
    this.registerForm = this.createForm();
  }

  ngOnInit(): void {
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
    return this.fb.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
            Validators.pattern(/^[a-zA-Z0-9_]+$/),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(120),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string | null {
    const field = this.registerForm.get(fieldName);

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

    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `Minimum ${requiredLength} characters`;
    }

    if (errors['maxlength']) {
      const requiredLength = errors['maxlength'].requiredLength;
      return `Maximum ${requiredLength} characters`;
    }

    if (errors['pattern']) {
      if (fieldName === 'username') {
        return 'Only letters, numbers, and underscores';
      }
      if (fieldName === 'password') {
        return 'Must contain an uppercase letter, a lowercase letter, and a number';
      }
    }

    if (errors['passwordMismatch']) {
      return 'Passwords do not match';
    }

    return 'Invalid field';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      username: 'User name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
    };

    return displayNames[fieldName] || fieldName;
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      // Setting data
      const signupData: SignupRequest = {
        username: this.registerForm.value.username.trim(),
        email: this.registerForm.value.email.trim().toLowerCase(),
        password: this.registerForm.value.password,
      };

      // API call
      this.authService.register(signupData).subscribe({
        next: response => {
          this.configService.logSecure('Registration successful');
          this.isSubmitting.set(false);

          // Auto redirect
          this.router.navigate(['/dashboard']);
        },
        error: error => {
          this.configService.logError('Registration failed', error);
          this.isSubmitting.set(false);

          if (error.includes('already exists')) {
            this.errorMessage.set('Username or email is already registered.');
          } else if (error.includes('Username already taken')) {
            this.errorMessage.set('Username is already taken.');
          } else {
            this.errorMessage.set('Registration error.Please try again.');
          }
        },
      });
    } else {
      //Mark all fields as touched to show errors
      this.markAllFieldsAsTouched();
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  // ============ Template methods ============

  hasError(): boolean {
    return !!this.errorMessage();
  }

  clearError(): void {
    this.errorMessage.set(null);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  // ============ Password validation methods ============

  private passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }

    return null;
  }

  hasMinLength(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password ? password.length >= 8 : false;
  }

  hasUppercase(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password ? /[A-Z]/.test(password) : false;
  }

  hasLowercase(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password ? /[a-z]/.test(password) : false;
  }

  hasNumber(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password ? /\d/.test(password) : false;
  }
}
