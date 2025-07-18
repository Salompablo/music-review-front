import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated and token is valid
  if (authService.isValidAuthenticated()) {
    return true;
  }

  // If token is expired, clear auth data and redirect
  if (authService.isAuthenticated() && authService.isTokenExpired()) {
    authService.logout();
  }

  // Redirect to signin page if not authenticated
  router.navigate(['/signin']);
  return false;
};
