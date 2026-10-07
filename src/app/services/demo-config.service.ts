import { Injectable, signal, computed } from '@angular/core';

export interface DemoConfig {
  // Layout selection
  boutiqueLayout: 'layout1' | 'layout2';

  // Boutique branding
  boutiqueBusinessTitle: string;
  boutiqueTagline: string;
  boutiquePrimaryColor: string;
  boutiqueAccentColor: string;
  boutiqueBgColor: string;
  boutiqueFooterBgColor: string;
  boutiqueButtonBgColor: string;
  boutiqueButtonTextColor: string;

  // Hero images (boutique)
  boutiqueHeroImage: string;
  boutiqueBannerVestidos: string;
  boutiqueBannerConjuntos: string;
  boutiqueBannerElegancia: string;

  // Logos (boutique)
  boutiqueLogoTop: string;
  boutiqueLogoFooter: string;
  boutiqueLogoTransparent: string;

  // Product images (boutique)
  boutiqueProduct1: string;
  boutiqueProduct2: string;
  boutiqueProduct3: string;
  boutiqueProduct4: string;
  boutiqueProduct5: string;
  boutiqueProduct6: string;
  boutiqueProduct7: string;
  boutiqueProduct8: string;
}

const STORAGE_KEY = 'samts_demo_config';

const DEFAULTS: DemoConfig = {
  boutiqueLayout: 'layout1',

  boutiqueBusinessTitle: 'Rosant Boutique',
  boutiqueTagline: 'Nueva colección de temporada · Envíos nacionales',
  boutiquePrimaryColor: '#1e1b19',
  boutiqueAccentColor: '#c5a882',
  boutiqueBgColor: '#ffffff',
  boutiqueFooterBgColor: '#c4b4a1',
  boutiqueButtonBgColor: '#1a1a1a',
  boutiqueButtonTextColor: '#ffffff',

  boutiqueHeroImage: '/images/boutique/hero.png',
  boutiqueBannerVestidos: '/images/boutique/banner-vestidos.png',
  boutiqueBannerConjuntos: '/images/boutique/banner-conjuntos.png',
  boutiqueBannerElegancia: '/images/boutique/banner-elegancia.png',

  boutiqueLogoTop: '/images/boutique/logo_top.png',
  boutiqueLogoFooter: '/images/boutique/logo_footer.png',
  boutiqueLogoTransparent: '/images/boutique/rosant-logo-transparent.png',

  boutiqueProduct1: '/images/boutique/product-1.png',
  boutiqueProduct2: '/images/boutique/product-2.png',
  boutiqueProduct3: '/images/boutique/product-3.png',
  boutiqueProduct4: '/images/boutique/product-4.png',
  boutiqueProduct5: '/images/boutique/product-5.png',
  boutiqueProduct6: '/images/boutique/product-6.png',
  boutiqueProduct7: '/images/boutique/product-7.png',
  boutiqueProduct8: '/images/boutique/product-8.png',
};

@Injectable({ providedIn: 'root' })
export class DemoConfigService {
  private _config = signal<DemoConfig>(this._loadFromStorage());

  readonly config = this._config.asReadonly();

  readonly hasCustomChanges = computed(() => {
    const c = this._config();
    return (Object.keys(DEFAULTS) as (keyof DemoConfig)[]).some(
      (k) => c[k] !== (DEFAULTS as any)[k]
    );
  });

  private _loadFromStorage(): DemoConfig {
    try {
      if (typeof localStorage === 'undefined') return { ...DEFAULTS };
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  update(partial: Partial<DemoConfig>): void {
    this._config.update((c) => {
      const next = { ...c, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  replaceImageFromFile(key: keyof DemoConfig, file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) this.update({ [key]: dataUrl } as Partial<DemoConfig>);
    };
    reader.readAsDataURL(file);
  }

  reset(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    this._config.set({ ...DEFAULTS });
  }

  getDefault(key: keyof DemoConfig): string {
    return (DEFAULTS as any)[key] as string;
  }
}
