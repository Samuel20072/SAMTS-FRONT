import { Component, OnInit, PLATFORM_ID, inject, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StickyCampaignCtaComponent } from './components/sticky-campaign-cta/sticky-campaign-cta.component';
import { CookieBannerComponent } from './components/cookie-banner/cookie-banner.component';
import { AnalyticsService } from './services/analytics.service';

declare global {
  interface Window { __samtsHideSplash?: () => void; }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, StickyCampaignCtaComponent, CookieBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private analytics = inject(AnalyticsService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private lastTrackedUrl = '';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // 1. Centralized tracking initialization (strictly browser-only)
      this.analytics.init();

      // 2. Automated page_view tracking on distinct route transitions
      this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects !== this.lastTrackedUrl) {
          this.lastTrackedUrl = event.urlAfterRedirects;
          const title = typeof document !== 'undefined' ? document.title : 'SAMTS';
          this.analytics.pageView(event.urlAfterRedirects, title);
        }
      });

      // 3. Hydration splash cleanup
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.__samtsHideSplash?.();
        }, 400);
      });
    }
  }
}
