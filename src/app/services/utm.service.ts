import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  source?: string;
  landingPage?: string;
  referrer?: string;
}

const SESSION_KEY = 'samts_utm';

/**
 * UTM Attribution Service
 * ────────────────────────
 * Reads UTM params from the URL on first visit and persists them in
 * sessionStorage so they survive the funnel flow (landing → form → success).
 *
 * Usage:
 *   const utm = inject(UtmService);
 *   utm.captureFromUrl(); // call in the landing page component
 *   const params = utm.getParams(); // call before form submit
 */
@Injectable({
  providedIn: 'root',
})
export class UtmService {
  private platformId = inject(PLATFORM_ID);

  /**
   * Reads UTM params from the current URL query string and stores them.
   * Only persists if there are new params (existing session not overwritten
   * unless new params are present — first-touch attribution).
   */
  captureFromUrl(urlParams: URLSearchParams): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const newParams: UtmParams = {
      utmSource: urlParams.get('utm_source') ?? undefined,
      utmMedium: urlParams.get('utm_medium') ?? undefined,
      utmCampaign: urlParams.get('utm_campaign') ?? undefined,
      utmContent: urlParams.get('utm_content') ?? undefined,
      utmTerm: urlParams.get('utm_term') ?? undefined,
      source: urlParams.get('source') ?? undefined,
      landingPage: window.location.href,
      referrer: document.referrer || undefined,
    };

    // Only save if at least one UTM param is present OR no session exists yet
    const hasNewUtm = !!(newParams.utmSource || newParams.utmMedium || newParams.utmCampaign);
    const existing = sessionStorage.getItem(SESSION_KEY);

    if (hasNewUtm || !existing) {
      // Always set landing page and referrer, merge with existing if any
      const merged: UtmParams = existing ? { ...JSON.parse(existing), ...this.clean(newParams) } : this.clean(newParams);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(merged));
    }
  }

  /** Retrieve persisted UTM params */
  getParams(): UtmParams {
    if (!isPlatformBrowser(this.platformId)) return {};
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  /** Clear after conversion (optional) */
  clear(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    sessionStorage.removeItem(SESSION_KEY);
  }

  private clean(params: UtmParams): UtmParams {
    return Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    ) as UtmParams;
  }
}
