import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { StickyCampaignCtaComponent } from './components/sticky-campaign-cta/sticky-campaign-cta.component';

declare global {
  interface Window { __samtsHideSplash?: () => void; }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, StickyCampaignCtaComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => {
        // Remove the HTML splash once Angular has hydrated
        setTimeout(() => {
          window.__samtsHideSplash?.();
        }, 400);
      });
    }
  }
}
