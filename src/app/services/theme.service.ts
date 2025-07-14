import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  public darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('darkMode');
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      const isDark =
        savedTheme === 'true' || (savedTheme === null && prefersDark);

      // Apply theme immediately to body for instant inheritance
      this.applyThemeToBody(isDark);
      this.darkModeSubject.next(isDark);
    }
  }

  private applyThemeToBody(isDark: boolean): void {
    if (typeof window !== 'undefined' && document.body) {
      if (isDark) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    }
  }

  toggleDarkMode(): void {
    const newValue = !this.darkModeSubject.value;

    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', newValue.toString());
      this.applyThemeToBody(newValue);
    }

    this.darkModeSubject.next(newValue);
  }

  getCurrentTheme(): boolean {
    return this.darkModeSubject.value;
  }
}
