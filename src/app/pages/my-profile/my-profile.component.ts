import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ThemeService } from '../../services/theme.service';

import {
  UserProfile,
  UserStats,
  UpdateUserProfileRequest,
  SongReview,
  AlbumReview,
  AuthProvider,
} from '../../interfaces/user.interface';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss',
})
export class MyProfileComponent implements OnInit {
  // Services
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  // Profile state
  currentUser = signal<UserProfile | null>(null);
  userStats = signal<UserStats | null>(null);
  isEditMode = signal<boolean>(false);

  // Reviews state
  songReviews = signal<SongReview[]>([]);
  albumReviews = signal<AlbumReview[]>([]);
  reviewsLoading = signal<boolean>(false);

  // Pagination
  songReviewsPage = signal<number>(0);
  albumReviewsPage = signal<number>(0);
  hasMoreSongReviews = signal<boolean>(true);
  hasMoreAlbumReviews = signal<boolean>(true);

  // UI state
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  activeTab = signal<'reviews' | 'song-reviews' | 'album-reviews'>('reviews');

  // Form data
  profileForm = signal<UpdateUserProfileRequest>({
    username: '',
    profilePictureUrl: '',
    biography: '',
  });

  // Error handling
  error = signal<string | null>(null);

  // Computed properties
  get isGoogleAccount(): boolean {
    return this.currentUser()?.provider === AuthProvider.GOOGLE;
  }

  get canEditEmail(): boolean {
    return !this.isGoogleAccount;
  }

  get canEditPassword(): boolean {
    return !this.isGoogleAccount;
  }

  get hasProfileImage(): boolean {
    return this.userService.hasProfileImage(this.currentUser() || undefined);
  }

  get profileImageUrl(): string | null {
    return this.userService.getProfileImageUrl(this.currentUser() || undefined);
  }

  get userInitials(): string {
    return this.userService.getUserInitials(this.currentUser() || undefined);
  }

  get accountTypeText(): string {
    return this.userService.getProviderText(this.currentUser() || undefined);
  }

  get isAdmin(): boolean {
    return this.userService.isAdmin(this.currentUser() || undefined);
  }

  get isModerator(): boolean {
    return this.userService.isModerator(this.currentUser() || undefined);
  }

  async ngOnInit() {
    await this.loadProfile();
  }

  // ============ Profile Loading ============

  private async loadProfile(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const user = this.authService.currentUser();
      if (!user?.username || !user?.userId) {
        console.warn('No current user found or missing data');
        this.router.navigate(['/signin']);
        return;
      }

      console.log('Loading profile for username:', user.username);

      const profile = await firstValueFrom(
        this.userService.getUserProfile(user.username)
      );

      if (profile) {
        this.currentUser.set(profile);
        this.initializeForm(profile);

        const stats = await firstValueFrom(
          this.userService.getUserStatsById(user.userId)
        );

        if (stats) {
          this.userStats.set(stats);
        }

        await this.loadReviews();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.error.set('Error loading profile data');
    } finally {
      this.loading.set(false);
    }
  }

  private initializeForm(profile: UserProfile): void {
    this.profileForm.set({
      username: profile.username,
      profilePictureUrl: profile.profilePictureUrl || '',
      biography: profile.biography || '',
    });
  }

  // ============ Reviews Loading ============

  private async loadReviews(): Promise<void> {
    const user = this.currentUser();
    if (!user?.userId) return;

    if (!this.authService.isValidAuthenticated()) {
      console.warn('Authentication invalid when loading reviews');
      return;
    }

    try {
      this.reviewsLoading.set(true);

      console.log('Loading reviews for user ID:', user.userId);

      const [songReviewsResponse, albumReviewsResponse] = await Promise.all([
        firstValueFrom(
          this.userService.getUserSongReviewsById(user.userId, 0, 5)
        ),
        firstValueFrom(
          this.userService.getUserAlbumReviewsById(user.userId, 0, 5)
        ),
      ]);

      if (songReviewsResponse) {
        this.songReviews.set(songReviewsResponse.content);
        this.hasMoreSongReviews.set(!songReviewsResponse.last);
      }

      if (albumReviewsResponse) {
        this.albumReviews.set(albumReviewsResponse.content);
        this.hasMoreAlbumReviews.set(!albumReviewsResponse.last);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      this.reviewsLoading.set(false);
    }
  }

  async loadMoreSongReviews(): Promise<void> {
    const user = this.currentUser();
    if (!user?.userId || !this.hasMoreSongReviews()) return;

    try {
      const nextPage = this.songReviewsPage() + 1;
      const response = await firstValueFrom(
        this.userService.getUserSongReviewsById(user.userId, nextPage, 5)
      );

      if (response) {
        this.songReviews.update(current => [...current, ...response.content]);
        this.songReviewsPage.set(nextPage);
        this.hasMoreSongReviews.set(!response.last);
      }
    } catch (error) {
      console.error('Error loading more song reviews:', error);
    }
  }

  async loadMoreAlbumReviews(): Promise<void> {
    const user = this.currentUser();
    if (!user?.userId || !this.hasMoreAlbumReviews()) return;

    try {
      const nextPage = this.albumReviewsPage() + 1;
      const response = await firstValueFrom(
        this.userService.getUserAlbumReviewsById(user.userId, nextPage, 5)
      );

      if (response) {
        this.albumReviews.update(current => [...current, ...response.content]);
        this.albumReviewsPage.set(nextPage);
        this.hasMoreAlbumReviews.set(!response.last);
      }
    } catch (error) {
      console.error('Error loading more album reviews:', error);
    }
  }

  // ============ Profile Editing ============

  toggleEditMode(): void {
    if (this.isEditMode()) {
      const user = this.currentUser();
      if (user) {
        this.initializeForm(user);
      }
    }
    this.isEditMode.update(current => !current);
  }

  async saveProfile(): Promise<void> {
    const user = this.currentUser();
    const formData = this.profileForm();

    if (!user || !formData.username?.trim()) {
      this.toastService.error('Username is required');
      return;
    }

    try {
      this.saving.set(true);

      const updatedProfile = await firstValueFrom(
        this.userService.updateUserProfile(user.userId, formData)
      );

      if (updatedProfile) {
        this.currentUser.set(updatedProfile);
        this.userService.updateCurrentUserProfileCache(updatedProfile);
        this.isEditMode.set(false);
        this.toastService.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      this.saving.set(false);
    }
  }

  // ============ UI Actions ============

  changeTab(tab: 'reviews' | 'song-reviews' | 'album-reviews'): void {
    this.activeTab.set(tab);
  }

  async refreshProfile(): Promise<void> {
    await this.loadProfile();
    this.toastService.success('Profile refreshed');
  }

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  // ============ Validation ============

  isFormValid(): boolean {
    const form = this.profileForm();
    return !!form.username?.trim();
  }

  hasUnsavedChanges(): boolean {
    const user = this.currentUser();
    const form = this.profileForm();

    if (!user || !this.isEditMode()) return false;

    return (
      user.username !== form.username ||
      (user.profilePictureUrl || '') !== (form.profilePictureUrl || '') ||
      (user.biography || '') !== (form.biography || '')
    );
  }
}
