import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // GET method
  get<T>(endpoint: string): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  // POST method
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, data, {
        headers: this.getContentTypeHeader(data),
      })
      .pipe(catchError(this.handleError));
  }

  // PUT method
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${endpoint}`, data, {
        headers: this.getContentTypeHeader(data),
      })
      .pipe(catchError(this.handleError));
  }

  // PATCH method
  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}${endpoint}`, data, {
        headers: this.getContentTypeHeader(data),
      })
      .pipe(catchError(this.handleError));
  }

  // DELETE method
  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  // Only for Content-Type
  private getContentTypeHeader(data?: any): HttpHeaders {
    let headers = new HttpHeaders();

    // Only add Content-Type if it's not FormData
    if (!(data instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return headers;
  }

  //Error handler
  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'Unknown error';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => errorMessage);
  }
}
