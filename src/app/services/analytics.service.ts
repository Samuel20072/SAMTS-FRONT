import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

/**
 * SAMTS Centralized Analytics Layer
 * ─────────────────────────────────
 * Single point of truth for all tracking events.
 * Supports: Google Analytics 4, Meta Pixel, Google Ads.
 *
 * HOW TO USE:
 *   inject(AnalyticsService).track('event_name', { key: 'value' });
 *
 * HOW TO CONFIGURE:
 *   Fill in the IDs in src/environments/environment.ts:
 *   - gaId          → Google Analytics 4 Measurement ID (G-XXXXXXXXXX)
 *   - metaPixelId   → Meta Pixel ID (123456789012345)
 *   - googleAdsId   → Google Ads ID (AW-XXXXXXXXX)
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
    _metaPixelInitialized?: boolean;
    _gaInitialized?: boolean;
  }
}

/** All event names used in SAMTS lead magnet funnel */
export type AnalyticsEvent =
  | 'page_view'
  | 'lead_magnet_view'
  | 'lead_magnet_form_open'
  | 'lead_magnet_form_submit'
  | 'pdf_download'
  | 'website_status_selected'
  | 'diagnostic_started'
  | 'whatsapp_click'
  | 'lead_converted';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  private readonly gaId = environment.gaId;
  private readonly metaPixelId = environment.metaPixelId;
  private readonly googleAdsId = environment.googleAdsId;

  /** Set of events already fired this session — prevents duplicates */
  private readonly firedEvents = new Set<string>();

  /** Initialize scripts. Call this once from AppComponent or App. */
  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initGA();
    this.initMetaPixel();
  }

  /**
   * Fire a named event. Automatically deduplicates within the session
   * unless `{ deduplicate: false }` is passed.
   */
  track(event: AnalyticsEvent, params: Record<string, any> = {}, opts: { deduplicate?: boolean } = {}): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const key = `${event}:${JSON.stringify(params)}`;
    if (opts.deduplicate !== false && this.firedEvents.has(key)) return;
    this.firedEvents.add(key);

    // ─── Google Analytics 4 ─────────────────────────────────────────
    this.gaEvent(event, params);

    // ─── Meta Pixel ─────────────────────────────────────────────────
    this.metaEvent(event, params);
  }

  /** Track a page view (call on route change) */
  pageView(url: string, title: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (window.gtag && this.gaId) {
      window.gtag('config', this.gaId, { page_path: url, page_title: title });
    }

    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private gaEvent(event: string, params: Record<string, any>): void {
    if (!window.gtag || !this.gaId) return;
    window.gtag('event', event, params);
  }

  private metaEvent(event: string, params: Record<string, any>): void {
    if (!window.fbq) return;

    // Map SAMTS events → Meta standard events where applicable
    const metaEventMap: Record<string, string> = {
      lead_magnet_form_submit: 'Lead',
      pdf_download: 'CompleteRegistration',
      diagnostic_started: 'InitiateCheckout',
      whatsapp_click: 'Contact',
      lead_converted: 'Purchase',
    };

    const metaEvent = metaEventMap[event];
    if (metaEvent) {
      window.fbq('track', metaEvent, params);
    } else {
      window.fbq('trackCustom', event, params);
    }
  }

  private initGA(): void {
    if (!this.gaId || window._gaInitialized) return;
    window._gaInitialized = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: any[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', this.gaId, { send_page_view: false });
  }

  private initMetaPixel(): void {
    if (!this.metaPixelId || window._metaPixelInitialized) return;
    window._metaPixelInitialized = true;

    /* Meta Pixel base code — injected programmatically */
    const f = window as any;
    const n: any = (f.fbq = function (...args: any[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    window.fbq?.('init', this.metaPixelId);
    window.fbq?.('track', 'PageView');
  }
}
