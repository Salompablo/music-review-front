import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { AlbumReview, SongReview, UpdateUserProfileRequest, UserProfile, UserStats } from '../interfaces/user.interface';
import { AuthService } from './auth.service';
import { PagedResponse } from '../interfaces/common.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  private currentUserProfile = signal<UserProfile | null>(null);

  constructor() {}

  // ============ Main methods ============

  /**
   * Get user profile by username
   * Endpoint: GET /api/v1/users/{username}
   */
  getUserProfile(username: string): Observable<UserProfile> {
    return this.apiService.get<UserProfile>(`/api/v1/users/${username}`);
  }

  /**
   * Get user stats
   * Endpoint: GET /api/v1/users/{username}/stats
   */
  getUserStats(username: string): Observable<UserStats> {
    return this.apiService.get<UserStats>(`/api/v1/users/${username}/stats`);
  }

  /**
   * Get user song reviews (paginated)
   * Endpoint: GET /api/v1/users/{username}/song-reviews
   */
  getUserSongReviews(
    username: string,
    page: number = 0,
    size: number = 10
  ): Observable<PagedResponse<SongReview>> {
    return this.apiService.get<PagedResponse<SongReview>>(
      `/api/v1/users/${username}/song-reviews?page=${page}&size=${size}`
    );
  }

  /**
   * Get user album reviews (paginated)
   * Endpoint: GET /api/v1/users/{username}/album-reviews
   */
  getUserAlbumReviews(
    username: string,
    page: number = 0,
    size: number = 10
  ): Observable<PagedResponse<AlbumReview>> {
    return this.apiService.get<PagedResponse<AlbumReview>>(
      `/api/v1/users/${username}/album-reviews?page=${page}&size=${size}`
    );
  }

  /**
   * Update user profile
   * Endpoint: PUT /api/v1/users/{userId}
   */
  updateUserProfile(
    userId: number,
    userData: UpdateUserProfileRequest
  ): Observable<UserProfile> {
    return this.apiService.put<UserProfile>(
      `/api/v1/users/${userId}`,
      userData
    );
  }

  /**
   * Delete user (admin only or own user)
   * Endpoint: DELETE /api/v1/users/{userId}
   */
  deleteUser(userId: number): Observable<void> {
    return this.apiService.delete<void>(`/api/v1/users/${userId}`);
  }

  // ============ Utility methods ============

  /**
   * Check if user has profile image
   */
  hasProfileImage(user?: UserProfile): boolean {
    const profile = user || this.authService.currentUser();
    return !!profile?.profilePictureUrl?.trim();
  }

  /**
   * Get profile image or null
   */
  getProfileImageUrl(user?: UserProfile): string | null {
    const profile = user || this.authService.currentUser();
    return profile?.profilePictureUrl || null;
  }

  /**
   * Check if user has biography
   */
  hasBiography(user?: UserProfile): boolean {
    const profile = user || this.authService.currentUser();
    return !!profile?.biography?.trim();
  }

  /**
   * Get formatted provider
   */
  getProviderText(user?: UserProfile): string {
    const profile = user || this.authService.currentUser();
    return profile?.provider === 'GOOGLE' ? 'Google Account' : 'Local Account';
  }

  /**
   * Check if the user is admin
   */
  isAdmin(user?: UserProfile): boolean {
    const profile = user || this.authService.currentUser();
    return profile?.roles?.includes('ROLE_ADMIN') || false;
  }

  /**
   * Check if the user is moderator
   */
  isModerator(user?: UserProfile): boolean {
    const profile = user || this.authService.currentUser();
    return profile?.roles?.includes('ROLE_MODERATOR') || false;
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(user?: UserProfile): string {
    const profile = user || this.authService.currentUser();
    const username = profile?.username || '';
    return username.slice(0, 2).toUpperCase();
  }

  /**
   * Check if the user is the current session user
   */
  isCurrentUser(username: string): boolean {
    return this.authService.currentUser()?.username === username;
  }

  /**
   * Check if the user can delete content
   */
  canDeleteContent(contentUserId: number): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.userId === contentUserId ||
    this.isAdmin() ||
    this.isModerator();
  }

  // ============ Cache methods ============

  /**
   * Get current user profile with cache
   */
  getCurrentUserProfile(): UserProfile | null {
    return this.currentUserProfile();
  }

  /**
   * Update user profile cache
   */
  updateCurrentUserProfileCache(profile: UserProfile): void {
    this.currentUserProfile.set(profile);
  }

  /**
   * Clear profile cache
   */
  clearProfileCache(): void {
    this.currentUserProfile.set(null);
  }
}
