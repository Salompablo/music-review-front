import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorMessage =
        error.error?.message || 'An unexpected error occurred';

      switch (error.status) {
        case 401:
          // Token expired or invalid
          authService.logout();
          router.navigate(['/signin']);
          toastService.error('Session expired. Please sign in again.');
          break;

        case 403:
          // Insufficient permissions
          toastService.error(
            "You don't have permission to perform this action."
          );
          break;

        case 404:
          // Resource not found
          toastService.error('The requested resource was not found.');
          break;

        case 500:
          // Internal server error
          toastService.error('Server error. Please try again later.');
          break;

        default:
          // Other errors - show backend message
          toastService.error(errorMessage);
      }

      return throwError(() => error);
    })
  );
};
