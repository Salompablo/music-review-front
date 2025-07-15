import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Endpoints that don't need token
  const excludedEndpoints = ['/auth', '/auth/register', '/auth/refresh'];
  const isExcluded = excludedEndpoints.some(endpoint => req.url.includes(endpoint));

  let authReq = req;

  // Add token if's not included
  if (!isExcluded) {
    const token = localStorage.getItem('token');

    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        }
      });
    }
  }

  return next(authReq).pipe(
    catchError((error) => {
      // Automatic handling of authentication errors
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
