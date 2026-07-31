import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { WelcomeIntroComponent } from './components/welcome-intro/welcome-intro.component';

declare global {
  interface Window { __samtsHideSplash?: () => void; }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WelcomeIntroComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private platformId = inject(PLATFORM_ID);

  /** True while the welcome intro should be visible */
  showIntro = signal(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => {
        // Remove the HTML splash first, then decide whether to show the intro
        setTimeout(() => {
          window.__samtsHideSplash?.();

          // Show intro only once per browser session
          const seen = sessionStorage.getItem('samts-intro-seen');
          if (!seen) {
            this.showIntro.set(true);
          }
        }, 400);
      });
    }
  }

  /** Called when the user clicks "Skip" or the 15 s timer runs out */
  onIntroFinished(): void {
    this.showIntro.set(false);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('samts-intro-seen', '1');
    }
  }
}
