import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  // API Configuration
  get apiUrl(): string {
    return environment.apiUrl;
  }

  get isProduction(): boolean {
    return environment.production;
  }

  get isDevelopment(): boolean {
    return !environment.production;
  }

  // Logging Configuration
  get enableLogging(): boolean {
    return environment.enableLogging;
  }

  get appVersion(): string {
    return environment.version;
  }

  // Feature Flags
  get enableRememberMe(): boolean {
    return environment.enableRememberMe ?? true;
  }

  get enableDarkMode(): boolean {
    return environment.enableDarkMode ?? true;
  }

  // Logging methods
  log(message: string, data?: any): void {
    if (this.enableLogging) {
      console.log(`[${new Date().toISOString()}] ${message}`, data);
    }
  }

  logError(message: string, error?: any): void {
    if (this.enableLogging) {
      console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error);
    }
  }

  logWarning(message: string, data?: any): void {
    if (this.enableLogging) {
      console.warn(`[${new Date().toISOString()}] WARNING: ${message}`, data);
    }
  }

  // Security: Never log sensitive data
  logSecure(message: string): void {
    if (this.enableLogging) {
      console.log(
        `[${new Date().toISOString()}] ${message} [SENSITIVE DATA HIDDEN]`
      );
    }
  }
}
