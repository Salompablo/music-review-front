import { Component, OnInit, OnDestroy } from '@angular/core';
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

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss',
})
export class SigninComponent implements OnInit, OnDestroy {
  signinForm: FormGroup;
  showPassword = false;
  isSubmitting = false;
  signinError = '';
  darkMode = false;

  private themeSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.signinForm = this.createForm();
  }

  ngOnInit(): void {
    this.themeSubscription = this.themeService.darkMode$.subscribe(
      isDarkMode => {
        this.darkMode = isDarkMode;
      }
    );
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signinForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.signinForm.valid) {
      this.isSubmitting = true;
      this.signinError = '';

      const formData = {
        email: this.signinForm.value.email,
        password: this.signinForm.value.password,
        rememberMe: this.signinForm.value.rememberMe,
      };

      // TODO: Replace with actual API call
      console.log('Sign in data:', formData);

      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;

        // Simulate successful or failed login
        const simulateSuccess = Math.random() > 0.3; // 70% success rate for demo

        if (simulateSuccess) {
          console.log('Sign in successful');
          // TODO: Handle successful sign in (save token, redirect, etc.)
          this.router.navigate(['/home']);
        } else {
          this.signinError = 'Invalid email or password. Please try again.';
        }
      }, 1500);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.signinForm.controls).forEach(key => {
        this.signinForm.get(key)?.markAsTouched();
      });
    }
  }
}
