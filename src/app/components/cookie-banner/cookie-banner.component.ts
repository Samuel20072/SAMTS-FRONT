import { Component, signal, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (isVisible()) {
      <aside
        role="dialog"
        aria-label="Consentimiento de cookies"
        class="cookie-banner"
      >
        <div class="cookie-content">
          <div class="cookie-text">
            <span class="cookie-badge"><i class="pi pi-shield"></i> Privacidad</span>
            <p>
              Utilizamos cookies técnicas y analíticas para optimizar el rendimiento y la experiencia de navegación en SAMTS.
              Puedes consultar nuestra
              <a routerLink="/privacy" (click)="dismissPrompt()" class="cookie-link">Política de Privacidad y Cookies</a>.
            </p>
          </div>
          <div class="cookie-actions">
            <button
              type="button"
              (click)="decline()"
              class="cookie-btn cookie-btn-decline"
            >
              Rechazar
            </button>
            <button
              type="button"
              (click)="accept()"
              class="cookie-btn cookie-btn-accept"
            >
              Aceptar cookies
            </button>
          </div>
        </div>
      </aside>
    }
  `,
  styles: [`
    .cookie-banner {
      position: fixed;
      bottom: 1.25rem;
      left: 1.25rem;
      right: 1.25rem;
      max-width: 720px;
      margin: 0 auto;
      background: #ffffff;
      color: #111318;
      border: 1px solid #E8E9ED;
      border-radius: 1rem;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      z-index: 9998;
      animation: bannerSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes bannerSlideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .cookie-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    @media (min-width: 640px) {
      .cookie-content {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }
    .cookie-text {
      font-size: 0.88rem;
      color: #444955;
      line-height: 1.5;
    }
    .cookie-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #315EFB;
      background: rgba(49, 94, 251, 0.1);
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      margin-bottom: 0.4rem;
    }
    .cookie-link {
      color: #315EFB;
      text-decoration: underline;
      font-weight: 600;
    }
    .cookie-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }
    .cookie-btn {
      padding: 0.6rem 1.2rem;
      border-radius: 0.65rem;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }
    .cookie-btn-decline {
      background: #F5F6FA;
      color: #444955;
      border: 1px solid #E8E9ED;
    }
    .cookie-btn-decline:hover {
      background: #EBEDF5;
      color: #111318;
    }
    .cookie-btn-accept {
      background: #315EFB;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(49, 94, 251, 0.3);
    }
    .cookie-btn-accept:hover {
      background: #2148D6;
      transform: translateY(-1px);
    }
  `]
})
export class CookieBannerComponent implements OnInit {
  private analytics = inject(AnalyticsService);
  private platformId = inject(PLATFORM_ID);

  isVisible = signal<boolean>(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Check if user has already made a consent choice
      if (!this.analytics.hasAnsweredConsent) {
        // Small delay so it doesn't block initial page paint
        setTimeout(() => {
          this.isVisible.set(true);
        }, 800);
      }
    }
  }

  accept(): void {
    this.analytics.setConsent(true);
    this.isVisible.set(false);
  }

  decline(): void {
    this.analytics.setConsent(false);
    this.isVisible.set(false);
  }

  dismissPrompt(): void {
    // Leaves prompt or hides temporarily if navigating to privacy
    this.isVisible.set(false);
  }
}
