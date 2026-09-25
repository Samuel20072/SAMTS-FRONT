import { Component, Input, Output, EventEmitter, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolutionPlan } from '../../core/models/samuel.models';

export interface DemoProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  inStock: boolean;
  quantity?: number;
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
  selector: 'app-business-preview-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './business-preview-modal.component.html',
  styleUrls: ['./business-preview-modal.component.scss'],
})
export class BusinessPreviewModalComponent implements OnInit {
  @Input() visible = false;
  @Input() plan: SolutionPlan | null = null;
  @Input() initialBusinessType = '';

  @Output() close = new EventEmitter<void>();
  @Output() orderPlan = new EventEmitter<SolutionPlan>();

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
      businessTitle: 'Aura Boutique & Moda',
      tagline: 'Nueva colección de temporada · Envíos nacionales',
      badge: 'Tendencias 2026',
      heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#e11d48',
      products: [
        {
          id: 'b1',
          name: 'Vestido Midi Silk Luxe',
          category: 'Vestidos',
          price: 45,
          image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'b2',
          name: 'Blazer Oversized Lino',
          category: 'Chaquetas',
          price: 65,
          image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'b3',
          name: 'Bolso de Cuero Minimal',
          category: 'Accesorios',
          price: 38,
          image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'b4',
          name: 'Conjunto Urban Casual',
          category: 'Conjuntos',
          price: 52,
          image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
          inStock: true,
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

  // Editable local product list
  editableProducts = signal<DemoProduct[]>([]);

  readonly currentNiche = computed(() => {
    return this.niches.find((n) => n.id === this.activeNicheId()) || this.niches[0];
  });

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

  ngOnInit(): void {
    this.selectInitialNiche();
  }

  private selectInitialNiche(): void {
    const bType = (this.initialBusinessType || '').toLowerCase();
    if (bType.includes('ropa') || bType.includes('boutique') || bType.includes('moda')) {
      this.activeNicheId.set('boutique');
    } else if (bType.includes('restaurante') || bType.includes('comida') || bType.includes('café')) {
      this.activeNicheId.set('restaurant');
    } else if (bType.includes('barber') || bType.includes('corte') || bType.includes('spa')) {
      this.activeNicheId.set('barbershop');
    } else if (bType.includes('servicio') || bType.includes('empresa') || bType.includes('consultor')) {
      this.activeNicheId.set('services');
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
    // Clone products for editable simulation
    this.editableProducts.set(JSON.parse(JSON.stringify(niche.products)));
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
        items.push(`• ${qty}x ${prod.name} ($${prod.price * qty} USD)`);
      }
    }

    if (items.length === 0) {
      return `¡Hola ${niche.businessTitle}! 👋\nVi su catálogo digital y me gustaría consultar disponibilidad de sus productos.`;
    }

    return (
      `¡Hola ${niche.businessTitle}! 👋\n` +
      `Me gustaría realizar el siguiente pedido desde su catálogo web:\n\n` +
      items.join('\n') +
      `\n\n*Total estimado:* $${this.totalCartPrice()} USD\n\n` +
      `¿Tienen disponibilidad para coordinar la entrega? Muchas gracias.`
    );
  }

  onOrderThisPlan(): void {
    if (this.plan) {
      this.orderPlan.emit(this.plan);
    }
  }

  onCloseModal(): void {
    this.close.emit();
  }
}
