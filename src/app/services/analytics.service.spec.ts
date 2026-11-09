import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { AnalyticsService, AnalyticsEvent } from './analytics.service';
import { environment } from '../../environments/environment';

describe('AnalyticsService (QA & GA4 Tests)', () => {
  let service: AnalyticsService;

  describe('Server-Side Rendering (SSR platformId: server)', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AnalyticsService,
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });
      service = TestBed.inject(AnalyticsService);
    });

    it('1. Returns false for isBrowser and isGAInitialized on SSR', () => {
      expect(service.isBrowser).toBe(false);
      expect(service.isGAInitialized).toBe(false);
    });

    it('2. Does not throw or manipulate DOM when init() is invoked on SSR', () => {
      expect(() => service.init()).not.toThrow();
      expect(service.isGAInitialized).toBe(false);
    });

    it('3. Safely ignores track(), pageView() and setConsent() on SSR', () => {
      expect(() => service.track('page_view')).not.toThrow();
      expect(() => service.pageView('/test', 'Test Title')).not.toThrow();
      expect(() => service.setConsent(false)).not.toThrow();
    });
  });

  describe('Browser Environment (platformId: browser)', () => {
    let mockDataLayer: any[];

    beforeEach(() => {
      mockDataLayer = [];
      (window as any).dataLayer = mockDataLayer;
      delete (window as any).gtag;
      delete (window as any)._gaInitialized;
      delete (window as any)._metaPixelInitialized;
      try {
        localStorage.clear();
      } catch {}

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AnalyticsService,
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });
      service = TestBed.inject(AnalyticsService);
    });

    it('4. Confirms isBrowser is true and initial unconsented state', () => {
      expect(service.isBrowser).toBe(true);
      expect(service.hasAnsweredConsent).toBe(false);
      expect(service.hasConsent).toBe(false);
    });

    it('5. Injects gtag and initializes Google Consent Mode v2 with denied by default on init()', () => {
      service.init();

      expect(window._gaInitialized).toBe(true);
      expect(typeof window.gtag).toBe('function');
      expect(window.dataLayer).toBeDefined();

      // Check consent default pushed to dataLayer: analytics_storage must be denied initially
      const consentCall = (window.dataLayer as any[]).find(
        call => Array.isArray(call) && call[0] === 'consent' && call[1] === 'default'
      );
      expect(consentCall).toBeDefined();
      expect(consentCall[2]?.analytics_storage).toBe('denied');
      expect(consentCall[2]?.ad_storage).toBe('denied');

      // Check config call with send_page_view: false
      const hasConfigCall = (window.dataLayer as any[]).some(
        call => Array.isArray(call) && call[0] === 'config' && call[2]?.send_page_view === false
      );
      expect(hasConfigCall).toBe(true);
    });

    it('6. Does not duplicate script or re-run setup on multiple init() calls', () => {
      service.init();
      const initialDataLayerLength = window.dataLayer?.length ?? 0;

      // Second invocation
      service.init();
      expect(window.dataLayer?.length).toBe(initialDataLayerLength);
    });

    it('7. Dispatches page_view correctly to gtag', () => {
      service.init();
      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;

      service.pageView('/catalogo', 'Catálogo SAMTS');

      expect(gtagSpy).toHaveBeenCalledWith('config', environment.gaId, {
        page_path: '/catalogo',
        page_title: 'Catálogo SAMTS',
      });
    });

    it('8. Dispatches custom events to gtag with parameters', () => {
      service.init();
      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;

      service.track('campaign_selected', { campaign: 'samts_catalog' });

      expect(gtagSpy).toHaveBeenCalledWith('event', 'campaign_selected', {
        campaign: 'samts_catalog',
      });
    });

    it('9. Deduplicates consecutive identical events unless deduplicate: false', () => {
      service.init();
      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;

      const eventName: AnalyticsEvent = 'how_we_work_viewed';
      service.track(eventName, { source: 'landing' });
      service.track(eventName, { source: 'landing' }); // Duplicate call

      expect(gtagSpy).toHaveBeenCalledTimes(1);

      // Explicit non-deduplicated call
      service.track(eventName, { source: 'landing' }, { deduplicate: false });
      expect(gtagSpy).toHaveBeenCalledTimes(2);
    });

    it('10. Updates Google Consent Mode and Meta Pixel state when setConsent() is called', () => {
      service.init();
      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;
      const fbqSpy = vi.fn();
      window.fbq = fbqSpy;

      service.setConsent(false);
      expect(service.hasConsent).toBe(false);
      expect(service.hasAnsweredConsent).toBe(true);
      expect(gtagSpy).toHaveBeenCalledWith('consent', 'update', expect.objectContaining({
        analytics_storage: 'denied',
      }));
      expect(fbqSpy).toHaveBeenCalledWith('consent', 'revoke');

      service.setConsent(true);
      expect(service.hasConsent).toBe(true);
      expect(gtagSpy).toHaveBeenCalledWith('consent', 'update', expect.objectContaining({
        analytics_storage: 'granted',
      }));
      expect(fbqSpy).toHaveBeenCalledWith('consent', 'grant');
    });

    it('11. Clears consent decision on resetConsentPrompt()', () => {
      service.setConsent(true);
      expect(service.hasConsent).toBe(true);

      service.resetConsentPrompt();
      expect(service.hasConsent).toBe(false);
      expect(service.hasAnsweredConsent).toBe(false);
    });
  });
});
