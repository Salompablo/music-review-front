import {
  AuthResponse,
  AuthRequest,
  SignupRequest,
  RefreshTokenRequest,
} from './../interfaces/auth.interface';
import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { UserProfile } from '../interfaces/user.interface';
import { BehaviorSubject, tap, catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);

  private tokenSignal = signal<string | null>(null);
  private userSignal = signal<UserProfile | null>(null);

  isAuthenticated = computed(() => !!this.tokenSignal());
  currentUser = computed(() => this.userSignal());

  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  // ============ Main methods ============

  /**
   * Loggin
   */
  login(
    credentials: AuthRequest,
    rememberMe: boolean = false
  ): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth', credentials).pipe(
      tap(response => {
        this.setAuthData(response, rememberMe);
      })
    );
  }

  /**
   * Register
   */
  register(userData: SignupRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/register', userData).pipe(
      tap(response => {
        this.setAuthData(response);
      })
    );
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refreshToken };

    return this.apiService.post<AuthResponse>('/auth/refresh', request).pipe(
      tap(response => {
        this.setAuthData(response);
      }),
      catchError(error => {
        console.error('Token refresh error:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  /**
   * Get complete user profile
   */
  getUserProfile(): Observable<UserProfile> {
    return this.apiService.get<UserProfile>('/api/v1/users/profile').pipe(
      tap(profile => {
        this.updateUserProfile(profile);
      })
    );
  }

  // ============ Verification methods ============

  /**
   * Check if the user has a specific role
   */
  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.roles.includes(role) || false;
  }

  /**
   * Check if the user has a specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    return user?.permissions.includes(permission) || false;
  }

  /**
   * Check if the user has any of the permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if the user has all of the permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Check if the user is an admin
   */
  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  /**
   * Check if the user can read
   */
  canRead(): boolean {
    return this.hasPermission('READ');
  }

  /**
   * Check if the user can write
   */
  canWrite(): boolean {
    return this.hasPermission('WRITE');
  }

  /**
   * Check if the user can delete
   */
  canDelete(): boolean {
    return this.hasPermission('DELETE');
  }

  // ============ Getters ============

  /**
   * Get token
   */
  getToken(): string | null {
    return (
      this.tokenSignal() ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('token')
    );
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  /**
   * Check if user is authenticated with valid token
   */
  isValidAuthenticated(): boolean {
    return this.isAuthenticated() && !this.isTokenExpired();
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return (
      localStorage.getItem('refreshToken') ||
      sessionStorage.getItem('refreshToken')
    );
  }

  /**
   * Get current user
   */
  getCurrentUser(): UserProfile | null {
    return this.userSignal();
  }

  /**
   * Get current user's ID
   */
  getCurrentUserId(): number | null {
    return this.currentUser()?.userId || null;
  }

  // ============ Private methods ============

  /**
   * Initialize authentication
   */
  private initializeAuth(): void {
    let token = localStorage.getItem('token');
    let user = localStorage.getItem('user');

    if (!token || !user) {
      token = sessionStorage.getItem('token');
      user = sessionStorage.getItem('user');
    }

    if (token && user) {
      try {
        const userProfile = JSON.parse(user);
        this.tokenSignal.set(token);
        this.userSignal.set(userProfile);
        this.currentUserSubject.next(userProfile);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuthData();
      }
    }
  }

  /**
   * Establish authentication data
   */
  private setAuthData(
    response: AuthResponse,
    rememberMe: boolean = false
  ): void {
    const userProfile: UserProfile = {
      userId: response.id,
      username: response.username,
      email: response.email,
      active: true,
      provider: 'LOCAL' as any,
      roles: ['ROLE_USER'],
      permissions: ['READ'],
    };

    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem('token', response.token);
    storage.setItem('refreshToken', response.refreshToken);
    storage.setItem('user', JSON.stringify(userProfile));

    this.tokenSignal.set(response.token);
    this.userSignal.set(userProfile);
    this.currentUserSubject.next(userProfile);
  }

  /**
   * Update user profile
   */
  private updateUserProfile(profile: UserProfile): void {
    localStorage.setItem('user', JSON.stringify(profile));
    this.userSignal.set(profile);
    this.currentUserSubject.next(profile);
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');

    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.currentUserSubject.next(null);
  }
}
