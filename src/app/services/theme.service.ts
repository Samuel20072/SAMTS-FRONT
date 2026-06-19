import { Injectable, signal } from '@angular/core';

const THEME_KEY = 'samts-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDark = signal(true);

  constructor() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Read from localStorage first, fall back to current class state
      const saved = localStorage.getItem(THEME_KEY);
      const dark = saved !== null ? saved === 'dark' : document.documentElement.classList.contains('dark');
      this.isDark.set(dark);
      this._apply(dark);
    }
  }

  toggleDarkMode() {
    const next = !this.isDark();
    this.isDark.set(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      this._apply(next);
    }
  }

  private _apply(dark: boolean) {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      dark ? html.classList.add('dark') : html.classList.remove('dark');
    }
  }
}

