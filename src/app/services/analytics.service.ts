import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
    _metaPixelInitialized?: boolean;
    _gaInitialized?: boolean;
  }
}

/** All event names used in SAMTS funnels and components */
export type AnalyticsEvent =
  | 'page_view'
  | 'lead_magnet_view'
  | 'lead_magnet_form_open'
  | 'lead_magnet_form_submit'
  | 'pdf_download'
  | 'website_status_selected'
  | 'diagnostic_started'
  | 'whatsapp_click'
  | 'lead_converted'
  | 'lead_created'
  | 'whatsapp_clicked'
  | 'consultation_submitted'
  | 'faq_opened'
  | 'how_we_work_viewed'
  | 'campaign_view'
  | 'campaign_form_open'
  | 'campaign_form_submit'
  | 'campaign_selected'
  | 'campaign_waitlist';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  private readonly gaId = environment.gaId;
  private readonly metaPixelId = environment.metaPixelId;
  private readonly googleAdsId = environment.googleAdsId;

  private readonly consentStorageKey = 'samts_cookie_consent';

  /** Set of events already fired this session — prevents duplicates */
  private readonly firedEvents = new Set<string>();

  /** Returns whether current execution environment is browser */
  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /** Returns whether GA4 is initialized */
  get isGAInitialized(): boolean {
    if (!this.isBrowser) return false;
    return typeof window !== 'undefined' && !!window._gaInitialized;
  }

  /**
   * Has the user responded to the consent dialog (either granted or denied)?
   */
  get hasAnsweredConsent(): boolean {
    return this.getStoredConsent() !== null;
  }

  /**
   * Returns current active consent (true if explicitly granted, false if denied or pending).
   */
  get hasConsent(): boolean {
    return this.getStoredConsent() === true;
  }

  /**
   * Sets user consent in compliance with Google Consent Mode v2 and Meta Pixel.
   */
  setConsent(granted: boolean): void {
    if (!this.isBrowser || typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.consentStorageKey, granted ? 'granted' : 'denied');
    } catch {
      // Fallback if localStorage is restricted
    }

    // Update Google Consent Mode v2
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
        ad_storage: granted ? 'granted' : 'denied',
        ad_user_data: granted ? 'granted' : 'denied',
        ad_personalization: granted ? 'granted' : 'denied',
      });
    }

    // Update Meta Pixel consent
    if (window.fbq) {
      window.fbq('consent', granted ? 'grant' : 'revoke');
    }
  }

  /**
   * Clear consent decision (used to let users re-evaluate choices from privacy page)
   */
  resetConsentPrompt(): void {
    if (!this.isBrowser || typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.consentStorageKey);
    } catch {}

    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }

    if (window.fbq) {
      window.fbq('consent', 'revoke');
    }
  }

  /** Initialize scripts. Called once upon Angular application bootstrap. */
  init(): void {
    if (!this.isBrowser) return;
    this.initGA();
    this.initMetaPixel();
  }

  /**
   * Fire a named event. Automatically deduplicates within the session
   * unless `{ deduplicate: false }` is passed.
   */
  track(event: AnalyticsEvent, params: Record<string, any> = {}, opts: { deduplicate?: boolean } = {}): void {
    if (!this.isBrowser) return;

    const key = `${event}:${JSON.stringify(params)}`;
    if (opts.deduplicate !== false && this.firedEvents.has(key)) return;
    this.firedEvents.add(key);

    // ─── Google Analytics 4 ─────────────────────────────────────────
    this.gaEvent(event, params);

    // ─── Meta Pixel ─────────────────────────────────────────────────
    this.metaEvent(event, params);
  }

  /** Track a page view on route change */
  pageView(url: string, title: string): void {
    if (!this.isBrowser) return;

    if (!window._gaInitialized && this.gaId) {
      this.initGA();
    }

    if (window.gtag && this.gaId) {
      window.gtag('config', this.gaId, { page_path: url, page_title: title });
    }

    if (window.fbq && this.hasConsent) {
      window.fbq('track', 'PageView');
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private getStoredConsent(): boolean | null {
    if (!this.isBrowser || typeof window === 'undefined') return null;
    try {
      const val = localStorage.getItem(this.consentStorageKey);
      if (val === 'granted') return true;
      if (val === 'denied') return false;
      return null;
    } catch {
      return null;
    }
  }

  private gaEvent(event: string, params: Record<string, any>): void {
    if (!this.gaId) return;

    if (!window._gaInitialized) {
      this.initGA();
    }

    if (window.gtag) {
      window.gtag('event', event, params);
    }
  }

  private metaEvent(event: string, params: Record<string, any>): void {
    // Strictly respect consent: never track on Meta if consent is denied
    if (!window.fbq || !this.hasConsent) return;

    const metaEventMap: Record<string, string> = {
      lead_magnet_form_submit: 'Lead',
      campaign_form_submit: 'Lead',
      lead_created: 'Lead',
      pdf_download: 'CompleteRegistration',
      diagnostic_started: 'InitiateCheckout',
      whatsapp_click: 'Contact',
      whatsapp_clicked: 'Contact',
      consultation_submitted: 'Contact',
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
    if (!this.gaId || typeof window === 'undefined' || window._gaInitialized) return;
    window._gaInitialized = true;

    // Attach script
    if (typeof document !== 'undefined') {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
      document.head.appendChild(script);
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: any[]) {
      window.dataLayer!.push(args);
    };

    // Google Consent Mode v2:
    // If user has not explicitly accepted yet, all categories default to 'denied'
    const isGranted = this.getStoredConsent() === true;
    window.gtag('consent', 'default', {
      analytics_storage: isGranted ? 'granted' : 'denied',
      ad_storage: isGranted ? 'granted' : 'denied',
      ad_user_data: isGranted ? 'granted' : 'denied',
      ad_personalization: isGranted ? 'granted' : 'denied',
      wait_for_update: 500,
    });

    window.gtag('js', new Date());
    // send_page_view: false ensures no duplicate automatic pageview;
    // handled explicitly on Angular NavigationEnd
    window.gtag('config', this.gaId, { send_page_view: false });
  }

  private initMetaPixel(): void {
    if (!this.metaPixelId || typeof window === 'undefined' || window._metaPixelInitialized) return;
    window._metaPixelInitialized = true;

    /* Meta Pixel base code */
    const f = window as any;
    const n: any = (f.fbq = function (...args: any[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];

    if (typeof document !== 'undefined') {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);
    }

    window.fbq?.('init', this.metaPixelId);
    if (this.hasConsent) {
      window.fbq?.('track', 'PageView');
    }
  }
}
