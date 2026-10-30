import { Injectable, signal, computed } from '@angular/core';
import { cdnUrl } from '../core/cdn';

export interface NicheConfig {
  businessTitle: string;
  tagline: string;
  primaryColor: string;
  accentColor?: string;
  bgColor: string;
  heroImage: string;
  productImages: string[];
}

export interface DemoConfig {
  activeNicheId: string;
  boutiqueLayout: 'layout1' | 'layout2';

  // Legacy boutique getters fallback
  boutiqueBusinessTitle: string;
  boutiqueTagline: string;
  boutiquePrimaryColor: string;
  boutiqueAccentColor: string;
  boutiqueBgColor: string;
  boutiqueFooterBgColor: string;
  boutiqueButtonBgColor: string;
  boutiqueButtonTextColor: string;
  boutiqueHeroImage: string;
  boutiqueBannerVestidos: string;
  boutiqueBannerConjuntos: string;
  boutiqueBannerElegancia: string;
  boutiqueLogoTop: string;
  boutiqueLogoFooter: string;
  boutiqueLogoTransparent: string;

  boutiqueProduct1: string;
  boutiqueProduct2: string;
  boutiqueProduct3: string;
  boutiqueProduct4: string;
  boutiqueProduct5: string;
  boutiqueProduct6: string;
  boutiqueProduct7: string;
  boutiqueProduct8: string;

  // Multi-niche configs
  niches: {
    boutique: NicheConfig;
    restaurant: NicheConfig;
    barbershop: NicheConfig;
    products: NicheConfig;
    services: NicheConfig;
  };
}

const STORAGE_KEY = 'samts_demo_config_v6';

// ── Versionado de assets estáticos ─────────────────────────────────
// Los archivos de `public/` no llevan hash en el nombre, así que el navegador y
// el CDN seguían sirviendo la versión antigua tras cada deploy. Para invalidar
// esa caché el nombre del archivo lleva un sufijo de versión (-v2) que se debe
// subir a la vez aquí y en los archivos de `public/images/`.
const ASSET_VERSION = 'v2';

/** Nombres antiguos que pueden seguir guardados en el localStorage de un usuario. */
const LEGACY_ASSET_PATHS: Record<string, string> = {
  '/images/boutique/banner-elegancia.png': '/images/boutique/ultimo-banner.png',
  '/images/boutique/ultimo banner.png': '/images/boutique/ultimo-banner.png',
  '/images/boutique/ultimo%20banner.png': '/images/boutique/ultimo-banner.png',
  '/images/boutique/logo_top.png': '/images/boutique/rosant-logo-transparent.png',
  '/images/boutique/logo_footer.png': '/images/boutique/rosant-logo-transparent.png',
  '/images/boutique/rosant-logo.png': '/images/boutique/rosant-logo-transparent.png',
};

const ASSET_PATH_RE = /^(\/(?:images|assets)\/[^?\s]+?)(?:-v\d+)?(\.[A-Za-z0-9]+)$/;

/** Reescribe una ruta de asset a la versión actual y la resuelve contra el CDN. */
function versionAssetPath(value: string): string {
  const canonical = LEGACY_ASSET_PATHS[value] ?? value;
  const match = ASSET_PATH_RE.exec(canonical);
  const versioned = match ? `${match[1]}-${ASSET_VERSION}${match[2]}` : canonical;
  return cdnUrl(versioned);
}

/** Aplica el versionado a todas las rutas de asset de la configuración. */
function versionAssetPaths<T>(value: T): T {
  if (typeof value === 'string') return versionAssetPath(value) as unknown as T;
  if (Array.isArray(value)) return value.map((item) => versionAssetPaths(item)) as unknown as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, versionAssetPaths(item)]),
    ) as T;
  }
  return value;
}

const DEFAULT_NICHES: DemoConfig['niches'] = {
  boutique: {
    businessTitle: 'Rosant Boutique',
    tagline: 'Nueva colección de temporada · Envíos nacionales',
    primaryColor: '#1e1b19',
    accentColor: '#c5a882',
    bgColor: '#ffffff',
    heroImage: '/images/boutique/hero-v2.png',
    productImages: [
      '/images/boutique/product-1-v2.png',
      '/images/boutique/product-2-v2.png',
      '/images/boutique/product-3-v2.png',
      '/images/boutique/product-4-v2.png',
      '/images/boutique/product-5-v2.png',
      '/images/boutique/product-6-v2.png',
      '/images/boutique/product-7-v2.png',
      '/images/boutique/product-8-v2.png',
    ],
  },
  restaurant: {
    businessTitle: 'La Casona Gourmet',
    tagline: 'Sabores artesanales · Pide en línea y recibe en tu mesa o domicilio',
    primaryColor: '#c99b53',
    accentColor: '#e5a852',
    bgColor: '#0a0a0c',
    heroImage: '/images/restaurant/hero-pasta-v2.jpg',
    productImages: [
      'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=600&q=80',
      '/images/restaurant/specialty-salmon-v2.jpg',
      'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
      '/images/restaurant/hero-pasta-v2.jpg',
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
    ],
  },
  barbershop: {
    businessTitle: 'Barbería Exclusiva',
    tagline: 'Cortes de autor, rituales de toalla caliente y perfilado al detalle. Reserva tu turno en segundos.',
    primaryColor: '#c99b53',
    accentColor: '#e5a852',
    bgColor: '#0a0a0c',
    heroImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
    productImages: [
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1597854710119-a5a8fc0b8751?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1512290900676-26c2a5a545b6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
    ],
  },
  products: {
    businessTitle: 'Emetix Audio & Tech',
    tagline: 'Special Discount Latest Audio System & Wearables · Free Shipping',
    primaryColor: '#f59e0b',
    accentColor: '#fbbf24',
    bgColor: '#111827',
    heroImage: '/images/tech/emetix-hero-v2.jpg',
    productImages: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
      '/images/tech/emetix-bento-camera-v2.jpg',
      '/images/tech/emetix-bento-smartwatch-v2.jpg',
      '/images/tech/emetix-bento-headphones-v2.jpg',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1584285418504-0050ec44b4b7?auto=format&fit=crop&w=600&q=80',
    ],
  },
  services: {
    businessTitle: 'Sevora Studio',
    tagline: 'Design Better, Faster, Smarter · Refined brands, websites & interfaces',
    primaryColor: '#0a0a0c',
    accentColor: '#374151',
    bgColor: '#f9fafb',
    heroImage: '/images/services/sevora-portrait-v2.jpg',
    productImages: [
      'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
    ],
  },
};

// Las rutas locales declaradas aquí pasan por el mismo versionado + CDN que las
// que llegan del localStorage, para que ambos caminos devuelvan URLs equivalentes.
const DEFAULTS: DemoConfig = versionAssetPaths<DemoConfig>({
  activeNicheId: 'boutique',
  boutiqueLayout: 'layout1',

  boutiqueBusinessTitle: DEFAULT_NICHES.boutique.businessTitle,
  boutiqueTagline: DEFAULT_NICHES.boutique.tagline,
  boutiquePrimaryColor: DEFAULT_NICHES.boutique.primaryColor,
  boutiqueAccentColor: DEFAULT_NICHES.boutique.accentColor || '#c5a882',
  boutiqueBgColor: DEFAULT_NICHES.boutique.bgColor,
  boutiqueFooterBgColor: '#c4b4a1',
  boutiqueButtonBgColor: '#1a1a1a',
  boutiqueButtonTextColor: '#ffffff',

  boutiqueHeroImage: DEFAULT_NICHES.boutique.heroImage,
  boutiqueBannerVestidos: '/images/boutique/banner-vestidos-v2.png',
  boutiqueBannerConjuntos: '/images/boutique/banner-conjuntos-v2.png',
  boutiqueBannerElegancia: '/images/boutique/ultimo-banner-v2.png',

  boutiqueLogoTop: '/images/boutique/rosant-logo-transparent-v2.png',
  boutiqueLogoFooter: '/images/boutique/rosant-logo-transparent-v2.png',
  boutiqueLogoTransparent: '/images/boutique/rosant-logo-transparent-v2.png',

  boutiqueProduct1: DEFAULT_NICHES.boutique.productImages[0],
  boutiqueProduct2: DEFAULT_NICHES.boutique.productImages[1],
  boutiqueProduct3: DEFAULT_NICHES.boutique.productImages[2],
  boutiqueProduct4: DEFAULT_NICHES.boutique.productImages[3],
  boutiqueProduct5: DEFAULT_NICHES.boutique.productImages[4],
  boutiqueProduct6: DEFAULT_NICHES.boutique.productImages[5],
  boutiqueProduct7: DEFAULT_NICHES.boutique.productImages[6],
  boutiqueProduct8: DEFAULT_NICHES.boutique.productImages[7],

  niches: DEFAULT_NICHES,
});

@Injectable({ providedIn: 'root' })
export class DemoConfigService {
  private _config = signal<DemoConfig>(this._loadFromStorage());

  readonly config = this._config.asReadonly();

  readonly hasCustomChanges = computed(() => {
    const c = this._config();
    return JSON.stringify(c.niches) !== JSON.stringify(DEFAULTS.niches);
  });

  private _loadFromStorage(): DemoConfig {
    try {
      if (typeof localStorage === 'undefined') return JSON.parse(JSON.stringify(DEFAULTS));
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULTS));
      // Las rutas de imagen quedan guardadas en el localStorage del usuario, así que
      // hay que reescribirlas a la versión actual de assets para no servir 404.
      const parsed = versionAssetPaths(JSON.parse(raw));
      return {
        ...DEFAULTS,
        ...parsed,
        niches: {
          ...DEFAULTS.niches,
          ...(parsed.niches || {}),
        },
      };
    } catch {
      return JSON.parse(JSON.stringify(DEFAULTS));
    }
  }

  update(partial: Partial<DemoConfig>): void {
    this._config.update((c) => {
      const next = { ...c, ...partial };
      if (partial.niches?.boutique) {
        next.boutiqueBusinessTitle = partial.niches.boutique.businessTitle;
        next.boutiqueTagline = partial.niches.boutique.tagline;
        next.boutiquePrimaryColor = partial.niches.boutique.primaryColor;
        next.boutiqueHeroImage = partial.niches.boutique.heroImage;
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  setActiveNicheId(nicheId: string): void {
    this.update({ activeNicheId: nicheId });
  }

  updateNiche(nicheId: keyof DemoConfig['niches'], partial: Partial<NicheConfig>): void {
    this._config.update((c) => {
      const currentNiche = c.niches[nicheId] || DEFAULTS.niches[nicheId];
      const updatedNiche = { ...currentNiche, ...partial };
      const nextNiches = { ...c.niches, [nicheId]: updatedNiche };

      const next = { ...c, niches: nextNiches };
      if (nicheId === 'boutique') {
        if (partial.businessTitle !== undefined) next.boutiqueBusinessTitle = partial.businessTitle;
        if (partial.tagline !== undefined) next.boutiqueTagline = partial.tagline;
        if (partial.primaryColor !== undefined) next.boutiquePrimaryColor = partial.primaryColor;
        if (partial.bgColor !== undefined) next.boutiqueBgColor = partial.bgColor;
        if (partial.heroImage !== undefined) next.boutiqueHeroImage = partial.heroImage;
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  replaceNicheImageFromFile(nicheId: keyof DemoConfig['niches'], field: 'heroImage' | number, file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;
      if (field === 'heroImage') {
        this.updateNiche(nicheId, { heroImage: dataUrl });
      } else {
        const idx = field as number;
        const currentImages = [...(this._config().niches[nicheId]?.productImages || DEFAULTS.niches[nicheId].productImages)];
        currentImages[idx] = dataUrl;
        this.updateNiche(nicheId, { productImages: currentImages });
      }
    };
    reader.readAsDataURL(file);
  }

  replaceImageFromFile(key: keyof DemoConfig, file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;
      this.update({ [key]: dataUrl } as Partial<DemoConfig>);
      if (typeof key === 'string' && key.startsWith('boutiqueProduct')) {
        const idx = parseInt(key.replace('boutiqueProduct', ''), 10) - 1;
        if (!isNaN(idx)) {
          this.replaceNicheImageFromFile('boutique', idx, file);
        }
      }
    };
    reader.readAsDataURL(file);
  }

  reset(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    this._config.set(JSON.parse(JSON.stringify(DEFAULTS)));
  }

  getDefault(key: keyof DemoConfig): string {
    return (DEFAULTS as any)[key] as string;
  }
}
