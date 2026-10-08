import { Component, Input, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SolutionPlan } from '../../core/models/samuel.models';
import { SamuelDiagnosisService } from '../../services/samuel-diagnosis.service';
import { ConsultationService } from '../../services/consultation.service';
import { BOUTIQUE_ASSETS } from '../../data/boutique-assets.data';
import { DemoConfigService } from '../../services/demo-config.service';

export interface DemoProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  inStock: boolean;
  size?: string;
  color?: string;
}

export interface DemoNiche {
  id: string;
  name: string;
  icon: string;
  businessTitle: string;
  tagline: string;
  badge: string;
  heroImage: string;
  primaryColor: string;
  products: DemoProduct[];
}

@Component({
  selector: 'app-business-demo-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './business-demo-section.component.html',
  styleUrls: ['./business-demo-section.component.scss'],
})
export class BusinessDemoSectionComponent implements OnInit {
  samuel = inject(SamuelDiagnosisService);
  modalService = inject(ConsultationService);
  demoConfig = inject(DemoConfigService);

  readonly boutiqueAssets = BOUTIQUE_ASSETS;

  /** Reactive boutique config from DemoConfigService */
  readonly demoAssets = computed(() => this.demoConfig.config());

  @Input() plan: SolutionPlan | null = null;
  @Input() initialBusinessType = '';

  deviceMode = signal<'desktop' | 'mobile'>('desktop');
  viewMode = signal<'client' | 'admin'>('client');
  activeNicheId = signal<string>('boutique');
  showWhatsAppMessageModal = signal<boolean>(false);

  // Cart state
  cart = signal<{ [productId: string]: number }>({});

  // Niches catalog
  readonly niches: DemoNiche[] = [
    {
      id: 'boutique',
      name: 'Ropa & Moda',
      icon: 'pi-tag',
      // These are static defaults; template reads reactive demoAssets() for boutique
      businessTitle: 'Rosant Boutique',
      tagline: 'Nueva colección de temporada · Envíos nacionales',
      badge: 'Nueva Colección',
      heroImage: BOUTIQUE_ASSETS.hero,
      primaryColor: '#2b241e',
      products: [
        {
          id: 'b1',
          name: 'Vestido Denim Ajustado',
          category: 'Vestiditos',
          price: 140000,
          image: BOUTIQUE_ASSETS.product1,
          inStock: true,
          size: 'M',
          color: 'Azul Denim',
        },
        {
          id: 'b2',
          name: 'Set Top & Jean Capri',
          category: 'Conjuntos',
          price: 110000,
          image: BOUTIQUE_ASSETS.product2,
          inStock: true,
          size: 'S',
          color: 'Celeste',
        },
        {
          id: 'b3',
          name: 'Blusa Encaje & Denim Celeste',
          category: 'Blusas',
          price: 120000,
          image: BOUTIQUE_ASSETS.product3,
          inStock: true,
          size: 'M',
          color: 'Blanco / Celeste',
        },
        {
          id: 'b4',
          name: 'Vestido Sexy Ruffle Blanco',
          category: 'Vestiditos',
          price: 150000,
          image: BOUTIQUE_ASSETS.product4,
          inStock: true,
          size: 'S',
          color: 'Blanco',
        },
        {
          id: 'b5',
          name: 'Top Royal Blue',
          category: 'Blusas',
          price: 130000,
          image: BOUTIQUE_ASSETS.product5,
          inStock: true,
          size: 'M',
          color: 'Azul Real',
        },
        {
          id: 'b6',
          name: 'Vestido Negro Ceñido',
          category: 'Vestiditos',
          price: 140000,
          image: BOUTIQUE_ASSETS.product6,
          inStock: true,
          size: 'L',
          color: 'Negro',
        },
        {
          id: 'b7',
          name: 'Vestido Fiesta Night',
          category: 'Vestiditos',
          price: 160000,
          image: BOUTIQUE_ASSETS.product7,
          inStock: true,
          size: 'M',
          color: 'Negro',
        },
        {
          id: 'b8',
          name: 'Enterizo Glam Dark Edition',
          category: 'Conjuntos',
          price: 150000,
          image: BOUTIQUE_ASSETS.product8,
          inStock: true,
          size: 'S',
          color: 'Negro',
        },
      ],
    },
    {
      id: 'restaurant',
      name: 'Restaurante & Comida',
      icon: 'pi-apple',
      businessTitle: 'La Casona Gourmet',
      tagline: 'Sabores artesanales · Pide en línea y recibe en tu mesa o domicilio',
      badge: 'Menú Digital',
      heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#ea580c',
      products: [
        {
          id: 'r1',
          name: 'Burger Angus Artesanal Doble',
          category: 'Hamburguesas',
          price: 14,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'r2',
          name: 'Pizza Rústica Trufa y Hongos',
          category: 'Pizzas',
          price: 18,
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'r3',
          name: 'Bowl Salmón & Aguacate',
          category: 'Saludables',
          price: 16,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'r4',
          name: 'Limonada de Coco & Menta',
          category: 'Bebidas',
          price: 5,
          image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
      ],
    },
    {
      id: 'barbershop',
      name: 'Barbería & Spa',
      icon: 'pi-star',
      businessTitle: 'Studio 99 Barber & Care',
      tagline: 'Cortes exclusivos y cuidado masculino · Agenda tu cita o servicio',
      badge: 'Citas & Servicios',
      heroImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#0284c7',
      products: [
        {
          id: 's1',
          name: 'Corte Signature + Lavado & Peinado',
          category: 'Cortes',
          price: 15,
          image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 's2',
          name: 'Ritual de Barba con Toalla Caliente',
          category: 'Barba',
          price: 12,
          image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 's3',
          name: 'Combo Full: Corte + Barba + Mascarilla',
          category: 'Combos',
          price: 24,
          image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 's4',
          name: 'Cera Mate Pomade Premium',
          category: 'Productos',
          price: 18,
          image: 'https://images.unsplash.com/photo-1597854710119-a5a8fc0b8751?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
      ],
    },
    {
      id: 'products',
      name: 'Tienda de Productos & Tech',
      icon: 'pi-box',
      businessTitle: 'NovaTech Solutions Store',
      tagline: 'Tecnología y accesorios garantizados · Envíos exprés',
      badge: 'Catálogo de Productos',
      heroImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#7c3aed',
      products: [
        {
          id: 't1',
          name: 'Auriculares Pro Wireless ANC',
          category: 'Audio',
          price: 59,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 't2',
          name: 'Smartwatch Serie Ultra Fit',
          category: 'Wearables',
          price: 79,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 't3',
          name: 'Soporte Ergonómico de Aluminio',
          category: 'Setup',
          price: 35,
          image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 't4',
          name: 'Powerbank MagSafe 10.000mAh',
          category: 'Carga',
          price: 42,
          image: 'https://images.unsplash.com/photo-1609592424368-2831d166fc49?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
      ],
    },
    {
      id: 'services',
      name: 'Servicios Profesionales',
      icon: 'pi-briefcase',
      businessTitle: 'Nexus Legal & Consulting',
      tagline: 'Asesoría estratégica y soluciones para empresas',
      badge: 'Servicios Profesionales',
      heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#059669',
      products: [
        {
          id: 'p1',
          name: 'Diagnóstico Legal & Corporativo',
          category: 'Auditoría',
          price: 120,
          image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'p2',
          name: 'Creación y Estructuración de Empresa',
          category: 'Constitución',
          price: 250,
          image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'p3',
          name: 'Registro de Marca & Patentes',
          category: 'Propiedad Intelectual',
          price: 180,
          image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'p4',
          name: 'Asesoría Tributaria Mensual',
          category: 'Contabilidad',
          price: 90,
          image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
      ],
    },
  ];

  editableProducts = signal<DemoProduct[]>([]);
  boutiqueActiveTab = signal<string>('todos');

  readonly currentNiche = computed(() => {
    return this.niches.find((n) => n.id === this.activeNicheId()) || this.niches[0];
  });

  readonly boutiqueRow1Products = computed(() => {
    return this.editableProducts().slice(0, 4);
  });

  readonly boutiqueRow2Products = computed(() => {
    const tab = this.boutiqueActiveTab();
    const all = this.editableProducts();
    if (tab === 'todos') {
      return all.slice(4, 8);
    }
    const filtered = all.filter((p) => p.category.toLowerCase().includes(tab.toLowerCase()));
    return filtered.length > 0 ? filtered : all.slice(4, 8);
  });

  setBoutiqueTab(tab: string): void {
    this.boutiqueActiveTab.set(tab);
  }

  setLayout(layout: 'layout1' | 'layout2'): void {
    this.demoConfig.update({ boutiqueLayout: layout });
  }

  readonly totalCartItems = computed(() => {
    const c = this.cart();
    return Object.values(c).reduce((sum, qty) => sum + qty, 0);
  });

  readonly totalCartPrice = computed(() => {
    const c = this.cart();
    const prods = this.editableProducts();
    let total = 0;
    for (const [id, qty] of Object.entries(c)) {
      const prod = prods.find((p) => p.id === id);
      if (prod) {
        total += prod.price * qty;
      }
    }
    return total;
  });

  constructor() {
    // Re-load boutique products whenever config changes (e.g. image swapped in editor)
    effect(() => {
      this.demoConfig.config(); // track changes
      if (this.activeNicheId() === 'boutique') {
        this.loadNicheProducts('boutique');
      }
    });
  }

  ngOnInit(): void {
    this.selectInitialNiche();
  }

  private selectInitialNiche(): void {
    const bType = (this.initialBusinessType || this.samuel.answers().businessType || '').toLowerCase();
    if (bType.includes('ropa') || bType.includes('boutique') || bType.includes('moda')) {
      this.activeNicheId.set('boutique');
    } else if (bType.includes('restaurante') || bType.includes('comida') || bType.includes('café')) {
      this.activeNicheId.set('restaurant');
    } else if (bType.includes('barber') || bType.includes('corte') || bType.includes('spa')) {
      this.activeNicheId.set('barbershop');
    } else if (bType.includes('servicio') || bType.includes('empresa') || bType.includes('consultor')) {
      this.activeNicheId.set('services');
    } else if (bType.includes('producto') || bType.includes('tienda')) {
      this.activeNicheId.set('products');
    } else {
      this.activeNicheId.set('boutique');
    }
    this.loadNicheProducts(this.activeNicheId());
  }

  setNiche(nicheId: string): void {
    this.activeNicheId.set(nicheId);
    this.cart.set({});
    this.loadNicheProducts(nicheId);
  }

  private loadNicheProducts(nicheId: string): void {
    const niche = this.niches.find((n) => n.id === nicheId) || this.niches[0];
    const products = JSON.parse(JSON.stringify(niche.products));

    // For boutique, override product images with values from DemoConfigService
    if (nicheId === 'boutique') {
      const cfg = this.demoConfig.config();
      products.forEach((p: DemoProduct, idx: number) => {
        const key = `boutiqueProduct${idx + 1}` as keyof typeof cfg;
        if (cfg[key]) p.image = cfg[key] as string;
      });
    }

    this.editableProducts.set(products);
  }

  addToCart(productId: string): void {
    this.cart.update((c) => {
      const current = c[productId] || 0;
      return { ...c, [productId]: current + 1 };
    });
  }

  removeFromCart(productId: string): void {
    this.cart.update((c) => {
      const current = c[productId] || 0;
      if (current <= 1) {
        const copy = { ...c };
        delete copy[productId];
        return copy;
      }
      return { ...c, [productId]: current - 1 };
    });
  }

  getCartQty(productId: string): number {
    return this.cart()[productId] || 0;
  }

  toggleStock(product: DemoProduct): void {
    product.inStock = !product.inStock;
    this.editableProducts.update((list) => [...list]);
  }

  updatePrice(product: DemoProduct, newPrice: string): void {
    const p = parseFloat(newPrice);
    if (!isNaN(p) && p >= 0) {
      product.price = p;
      this.editableProducts.update((list) => [...list]);
    }
  }

  openWhatsAppMessagePreview(): void {
    this.showWhatsAppMessageModal.set(true);
  }

  closeWhatsAppMessagePreview(): void {
    this.showWhatsAppMessageModal.set(false);
  }

  buildWhatsAppFormattedText(): string {
    const niche = this.currentNiche();
    const c = this.cart();
    const prods = this.editableProducts();
    const items: string[] = [];

    for (const [id, qty] of Object.entries(c)) {
      const prod = prods.find((p) => p.id === id);
      if (prod && qty > 0) {
        const priceStr =
          niche.id === 'boutique'
            ? `$${(prod.price * qty).toLocaleString('es-CO')} COP`
            : `$${prod.price * qty} USD`;

        const details: string[] = [];
        if (prod.size) details.push(`Talla: ${prod.size}`);
        if (prod.color) details.push(`Color: ${prod.color}`);
        const attrStr = details.length > 0 ? ` (${details.join(', ')})` : '';

        items.push(`• ${qty}x ${prod.name}${attrStr} - ${priceStr}`);
      }
    }

    if (items.length === 0) {
      if (niche.id === 'boutique') {
        return (
          `¡Hola, buenas! 👋\n` +
          `Quiero pedir este producto:\n\n` +
          `• *Producto:* Vestido Denim Ajustado\n` +
          `• *Talla:* M\n` +
          `• *Color:* Azul Denim\n` +
          `• *Cantidad:* 1\n` +
          `• *Precio:* $140.000 COP\n\n` +
          `*Total estimado:* $140.000 COP\n\n` +
          `¿Tienen disponibilidad para coordinar la entrega? Muchas gracias.`
        );
      }
      return `¡Hola, buenas! 👋\nQuiero realizar un pedido desde su catálogo digital. ¿Tienen disponibilidad de sus productos?`;
    }

    const totalStr =
      niche.id === 'boutique'
        ? `$${this.totalCartPrice().toLocaleString('es-CO')} COP`
        : `$${this.totalCartPrice()} USD`;

    return (
      `¡Hola, buenas! 👋\n` +
      `Quiero realizar el siguiente pedido desde su catálogo web:\n\n` +
      items.join('\n') +
      `\n\n*Total estimado:* ${totalStr}\n\n` +
      `¿Tienen disponibilidad para coordinar la entrega? Muchas gracias.`
    );
  }

  onOrderSolution(): void {
    const msg = encodeURIComponent(this.samuel.buildWhatsAppMessage());
    const phone = '573000000000';
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }

  openConsultation(): void {
    this.modalService.open();
  }

  getCleanSlug(title: string): string {
    if (!title) return 'demo';
    return title.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  getDiscountAmount(price: number): number {
    return Math.round(price * 0.2);
  }

  scrollToHero(): void {
    const hero = document.getElementById('hero');
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
