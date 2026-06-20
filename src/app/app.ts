import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';

declare global {
  interface Window { __samtsHideSplash?: () => void; }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Small delay so first frame is painted before removing splash
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.__samtsHideSplash?.();
        }, 400);
      });
    }
  }
}
