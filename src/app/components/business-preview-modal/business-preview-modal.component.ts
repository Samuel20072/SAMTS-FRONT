import { Component, Input, Output, EventEmitter, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolutionPlan } from '../../core/models/samuel.models';
import { cdnUrl } from '../../core/cdn';

export interface DemoProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  inStock: boolean;
  quantity?: number;
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

  // Admin Panel Tab & Demo States
  adminActiveTab = signal<'products' | 'whatsapp' | 'stats' | 'settings'>('products');
  showCreateProductModal = signal<boolean>(false);
  showAiChatSimModal = signal<boolean>(false);
  activeSimOrder = signal<any | null>(null);
  adminToastMessage = signal<string | null>(null);

  // New product form
  newProdName = signal<string>('');
  newProdCategory = signal<string>('Colección Exclusiva');
  newProdPrice = signal<number>(120);
  newProdImage = signal<string>('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80');

  // Settings
  settingsBusinessName = signal<string>('Rosant');
  settingsPhone = signal<string>('+57 300 123 4567');
  settingsCurrency = signal<string>('USD');
  settingsAiEnabled = signal<boolean>(true);
  settingsWelcomeMsg = signal<string>('¡Hola! 👋 Bienvenido a nuestro negocio. Soy tu asistente de IA 24/7. ¿En qué te podemos asesorar hoy?');

  // WhatsApp Demo Orders
  whatsappOrders = signal([
    {
      id: '#1004', customer: 'Valentina Ríos', avatar: '🌸', phone: '+57 312 890 4421',
      items: '1x Vestido Fiesta Night + 1x Top Royal Blue', total: '$290 USD', time: 'Hace 5 min',
      status: 'Nuevo', statusClass: 'status-new',
      dialog: [
        { sender: 'user', text: '¡Hola! Me interesan el Vestido Fiesta Night en talla M y el Top Royal Blue.' },
        { sender: 'bot', text: '¡Hola Valentina! 🌟 Claro, ambos están disponibles. El total con envío exprés es $290 USD. ¿A qué dirección registramos el despacho?' },
        { sender: 'user', text: 'Envíalo a Calle 85 #12-45 Apto 402. Pago por Nequi/Wompi.' },
        { sender: 'bot', text: '¡Pedido #1004 generado con éxito! Te enviamos el link de pago seguro. 📦' }
      ]
    },
    {
      id: '#1003', customer: 'Carlos Mendoza', avatar: '👨‍💼', phone: '+57 301 456 7890',
      items: '2x Set Top & Jean Capri', total: '$220 USD', time: 'Hace 32 min',
      status: 'En Proceso', statusClass: 'status-progress',
      dialog: [
        { sender: 'user', text: 'Buenas tardes, ¿tienen disponibilidad del Set Capri en talla S?' },
        { sender: 'bot', text: '¡Hola Carlos! Sí, tenemos 3 unidades en stock. ¿Deseas ordenar 2 conjuntos con un 10% de descuento?' },
        { sender: 'user', text: 'Sí, por favor. Envío a Bogotá.' }
      ]
    },
    {
      id: '#1002', customer: 'Mariana Gómez', avatar: '👩', phone: '+57 315 234 5678',
      items: '1x Blusa Encaje & Denim Celeste', total: '$120 USD', time: 'Hace 2 horas',
      status: 'Completado', statusClass: 'status-completed',
      dialog: [
        { sender: 'user', text: '¿El envío a Medellín tarda mucho?' },
        { sender: 'bot', text: 'Llega en 24 horas hábiles. Tu guía de rastreo es Servientrega #994821. 🚚' }
      ]
    },
    {
      id: '#1001', customer: 'Andrés Silva', avatar: '🧑', phone: '+57 300 987 6543',
      items: '1x Enterizo Glam Dark Edition', total: '$150 USD', time: 'Ayer',
      status: 'Completado', statusClass: 'status-completed',
      dialog: [
        { sender: 'user', text: 'Gracias por la atención rápida, la prenda llegó perfecta 👌' },
        { sender: 'bot', text: '¡Con mucho gusto Andrés! Gracias por comprar con nosotros. ✨' }
      ]
    }
  ]);

  // Cart state
  cart = signal<{ [productId: string]: number }>({});

  // Niches catalog
  readonly niches: DemoNiche[] = [
    {
      id: 'boutique',
      name: 'Ropa & Moda',
      icon: 'pi-tag',
      businessTitle: 'Rosant',
      tagline: 'Tu marca, tu estilo, tu esencia',
      badge: 'Nueva Colección',
      heroImage: cdnUrl('/images/boutique/hero-v2.png'),
      primaryColor: '#2b241e',
      products: [
        {
          id: 'b1',
          name: 'Vestido Denim Ajustado',
          category: 'Vestiditos',
          price: 140000,
          image: cdnUrl('/images/boutique/product-1-v2.png'),
          inStock: true,
          size: 'M',
          color: 'Azul Denim',
        },
        {
          id: 'b2',
          name: 'Set Top & Jean Capri',
          category: 'Conjuntos',
          price: 110000,
          image: cdnUrl('/images/boutique/product-2-v2.png'),
          inStock: true,
          size: 'S',
          color: 'Celeste',
        },
        {
          id: 'b3',
          name: 'Blusa Encaje & Denim Celeste',
          category: 'Blusas',
          price: 120000,
          image: cdnUrl('/images/boutique/product-3-v2.png'),
          inStock: true,
          size: 'M',
          color: 'Blanco / Celeste',
        },
        {
          id: 'b4',
          name: 'Vestido Sexy Ruffle Blanco',
          category: 'Vestiditos',
          price: 150000,
          image: cdnUrl('/images/boutique/product-4-v2.png'),
          inStock: true,
          size: 'S',
          color: 'Blanco',
        },
        {
          id: 'b5',
          name: 'Top Royal Blue',
          category: 'Blusas',
          price: 130000,
          image: cdnUrl('/images/boutique/product-5-v2.png'),
          inStock: true,
          size: 'M',
          color: 'Azul Real',
        },
        {
          id: 'b6',
          name: 'Vestido Negro Ceñido',
          category: 'Vestiditos',
          price: 140000,
          image: cdnUrl('/images/boutique/product-6-v2.png'),
          inStock: true,
          size: 'L',
          color: 'Negro',
        },
        {
          id: 'b7',
          name: 'Vestido Fiesta Night',
          category: 'Vestiditos',
          price: 160000,
          image: cdnUrl('/images/boutique/product-7-v2.png'),
          inStock: true,
          size: 'M',
          color: 'Negro',
        },
        {
          id: 'b8',
          name: 'Enterizo Glam Dark Edition',
          category: 'Conjuntos',
          price: 150000,
          image: cdnUrl('/images/boutique/product-8-v2.png'),
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
      businessTitle: 'Emetix Audio & Tech',
      tagline: 'Special Discount Latest Audio System & Wearables · Free Shipping',
      badge: 'Special Discount',
      heroImage: cdnUrl('/images/tech/emetix-hero-v2.jpg'),
      primaryColor: '#f59e0b',
      products: [
        {
          id: 't1',
          name: 'Wireless Smart Audio Capsule',
          category: 'Audio',
          price: 79,
          image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 't2',
          name: 'Smart 360 Vision Tripod Cam',
          category: 'Cámaras',
          price: 80,
          image: cdnUrl('/images/tech/emetix-bento-camera-v2.jpg'),
          inStock: true,
        },
        {
          id: 't3',
          name: 'Smartwatch Serie Ultra Sport',
          category: 'Wearables',
          price: 80,
          image: cdnUrl('/images/tech/emetix-bento-smartwatch-v2.jpg'),
          inStock: true,
        },
        {
          id: 't4',
          name: 'Studio Master Wireless ANC Headset',
          category: 'Audio',
          price: 120,
          image: cdnUrl('/images/tech/emetix-bento-headphones-v2.jpg'),
          inStock: true,
        },
      ],
    },
    {
      id: 'services',
      name: 'Servicios Personales & Diseño',
      icon: 'pi-user',
      businessTitle: 'Sevora Studio',
      tagline: 'Design Better, Faster, Smarter · Refined brands, websites & interfaces',
      badge: 'Product Design & Creative Direction',
      heroImage: cdnUrl('/images/services/sevora-portrait-v2.jpg'),
      primaryColor: '#0a0a0c',
      products: [
        {
          id: 'p1',
          name: 'Brand Strategy & Visual Identity',
          category: 'Branding',
          price: 1800,
          image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'p2',
          name: 'High-Converting Web & UI Design',
          category: 'Web & UI',
          price: 2400,
          image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'p3',
          name: 'Design System & Frontend Handoff',
          category: 'Sistemas',
          price: 1600,
          image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'p4',
          name: 'Fractional Design Partner (Retainer)',
          category: 'Acompañamiento',
          price: 3200,
          image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
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

  triggerAdminToast(msg: string): void {
    this.adminToastMessage.set(msg);
    setTimeout(() => this.adminToastMessage.set(null), 3500);
  }

  saveNewProductDemo(): void {
    const name = this.newProdName().trim() || 'Producto Exclusivo Demo';
    const cat = this.newProdCategory().trim() || 'Novedades';
    const price = this.newProdPrice() || 120;
    const img = this.newProdImage() || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80';
    const newProd: DemoProduct = {
      id: 'demo-' + Date.now(), name, category: cat, price, image: img, inStock: true
    };
    this.editableProducts.update(prods => [newProd, ...prods]);
    this.showCreateProductModal.set(false);
    this.newProdName.set('');
    this.triggerAdminToast(`✨ ¡Producto "${name}" agregado al catálogo en vivo!`);
  }

  saveSettingsDemo(): void {
    this.triggerAdminToast('⚡ ¡Configuración guardada! Tu sitio web y bot de IA están sincronizados.');
  }

  openAiChatSimulation(order: any): void {
    this.activeSimOrder.set(order);
    this.showAiChatSimModal.set(true);
  }

  closeAiChatSimulation(): void {
    this.showAiChatSimModal.set(false);
    this.activeSimOrder.set(null);
  }

  getDiscountAmount(price: number): number {
    return Math.round(price * 0.2);
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

  onOrderThisPlan(): void {
    if (this.plan) {
      this.orderPlan.emit(this.plan);
    }
  }

  onCloseModal(): void {
    this.close.emit();
  }
}
