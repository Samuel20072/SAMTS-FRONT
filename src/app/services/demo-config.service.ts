import { Injectable, signal, computed } from '@angular/core';

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

const STORAGE_KEY = 'samts_demo_config_v3';

const DEFAULT_NICHES: DemoConfig['niches'] = {
  boutique: {
    businessTitle: 'Rosant Boutique',
    tagline: 'Nueva colección de temporada · Envíos nacionales',
    primaryColor: '#1e1b19',
    accentColor: '#c5a882',
    bgColor: '#ffffff',
    heroImage: '/images/boutique/hero.png',
    productImages: [
      '/images/boutique/product-1.png',
      '/images/boutique/product-2.png',
      '/images/boutique/product-3.png',
      '/images/boutique/product-4.png',
      '/images/boutique/product-5.png',
      '/images/boutique/product-6.png',
      '/images/boutique/product-7.png',
      '/images/boutique/product-8.png',
    ],
  },
  restaurant: {
    businessTitle: 'La Casona Gourmet',
    tagline: 'Sabores artesanales · Pide en línea y recibe en tu mesa o domicilio',
    primaryColor: '#ea580c',
    accentColor: '#f97316',
    bgColor: '#1a1612',
    heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    productImages: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1621996346565-e3d5d6281313?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80',
    ],
  },
  barbershop: {
    businessTitle: 'Studio 99 Barber & Care',
    tagline: 'Cortes exclusivos y cuidado masculino · Agenda tu cita o servicio',
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    bgColor: '#0f172a',
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
    businessTitle: 'NovaTech Solutions Store',
    tagline: 'Tecnología y accesorios garantizados · Envíos exprés',
    primaryColor: '#7c3aed',
    accentColor: '#a78bfa',
    bgColor: '#1e1b4b',
    heroImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=80',
    productImages: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1609592424368-2831d166fc49?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?auto=format&fit=crop&w=600&q=80',
    ],
  },
  services: {
    businessTitle: 'Nexus Legal & Consulting',
    tagline: 'Asesoría estratégica y soluciones para empresas',
    primaryColor: '#059669',
    accentColor: '#34d399',
    bgColor: '#064e3b',
    heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    productImages: [
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
    ],
  },
};

const DEFAULTS: DemoConfig = {
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
  boutiqueBannerVestidos: '/images/boutique/banner-vestidos.png',
  boutiqueBannerConjuntos: '/images/boutique/banner-conjuntos.png',
  boutiqueBannerElegancia: '/images/boutique/banner-elegancia.png',

  boutiqueLogoTop: '/images/boutique/logo_top.png',
  boutiqueLogoFooter: '/images/boutique/logo_footer.png',
  boutiqueLogoTransparent: '/images/boutique/rosant-logo-transparent.png',

  boutiqueProduct1: DEFAULT_NICHES.boutique.productImages[0],
  boutiqueProduct2: DEFAULT_NICHES.boutique.productImages[1],
  boutiqueProduct3: DEFAULT_NICHES.boutique.productImages[2],
  boutiqueProduct4: DEFAULT_NICHES.boutique.productImages[3],
  boutiqueProduct5: DEFAULT_NICHES.boutique.productImages[4],
  boutiqueProduct6: DEFAULT_NICHES.boutique.productImages[5],
  boutiqueProduct7: DEFAULT_NICHES.boutique.productImages[6],
  boutiqueProduct8: DEFAULT_NICHES.boutique.productImages[7],

  niches: DEFAULT_NICHES,
};

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
      const parsed = JSON.parse(raw);
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
