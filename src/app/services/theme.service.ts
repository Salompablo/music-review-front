import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  public darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('darkMode');
    const isDarkMode = savedTheme === 'true';
    this.setDarkMode(isDarkMode, false); // false to skip animation on initial load
  }

  toggleDarkMode(): void {
    const newDarkMode = !this.darkModeSubject.value;
    this.setDarkMode(newDarkMode);
  }

  setDarkMode(isDarkMode: boolean, animate: boolean = true): void {
    if (animate) {
      // Add temporary class to ensure all elements transition together
      document.body.classList.add('theme-switching');
    }

    this.darkModeSubject.next(isDarkMode);

    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    // Save preference
    localStorage.setItem('darkMode', isDarkMode.toString());

    if (animate) {
      // Remove the temporary class after transition completes
      setTimeout(() => {
        document.body.classList.remove('theme-switching');
      }, 350); // Match the transition duration in CSS variables
    }
  }

  getCurrentTheme(): boolean {
    return this.darkModeSubject.value;
  }
}
