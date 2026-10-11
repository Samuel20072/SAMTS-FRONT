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

  // Admin Panel Tab & Demo States
  adminActiveTab = signal<'products' | 'whatsapp' | 'stats' | 'settings'>('products');
  showCreateProductModal = signal<boolean>(false);
  showAiChatSimModal = signal<boolean>(false);
  activeSimOrder = signal<any | null>(null);
  adminToastMessage = signal<string | null>(null);

  // New product form inputs
  newProdName = signal<string>('');
  newProdCategory = signal<string>('Colección Exclusiva');
  newProdPrice = signal<number>(120);
  newProdImage = signal<string>('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80');

  // Settings inputs
  settingsBusinessName = signal<string>('Rosant Boutique');
  settingsPhone = signal<string>('+57 300 123 4567');
  settingsCurrency = signal<string>('USD');
  settingsAiEnabled = signal<boolean>(true);
  settingsWelcomeMsg = signal<string>('¡Hola! 👋 Bienvenido a nuestro negocio. Soy tu asistente de IA 24/7. ¿En qué producto o servicio te podemos asesorar hoy?');

  // WhatsApp Incoming Orders Demo Data
  whatsappOrders = signal([
    {
      id: '#1004',
      customer: 'Valentina Ríos',
      avatar: '🌸',
      phone: '+57 312 890 4421',
      items: '1x Vestido Fiesta Night + 1x Top Royal Blue',
      total: '$290 USD',
      time: 'Hace 5 min',
      status: 'Nuevo',
      statusClass: 'status-new',
      dialog: [
        { sender: 'user', text: '¡Hola! Me interesan el Vestido Fiesta Night en talla M y el Top Royal Blue.' },
        { sender: 'bot', text: '¡Hola Valentina! 🌟 Claro que sí, ambos están disponibles en stock. El total con envío exprés es $290 USD. ¿A qué dirección registramos tu despacho?' },
        { sender: 'user', text: 'Excelente, envíalo a la Calle 85 #12-45 Apto 402. Pago por Nequi/Wompi.' },
        { sender: 'bot', text: '¡Pedido #1004 generado con éxito! Te enviamos el link de pago seguro por WhatsApp. 📦' }
      ]
    },
    {
      id: '#1003',
      customer: 'Carlos Mendoza',
      avatar: '👨‍💼',
      phone: '+57 301 456 7890',
      items: '2x Set Top & Jean Capri',
      total: '$220 USD',
      time: 'Hace 32 min',
      status: 'En Proceso',
      statusClass: 'status-progress',
      dialog: [
        { sender: 'user', text: 'Buenas tardes, ¿tienen disponibilidad del Set Capri en talla S?' },
        { sender: 'bot', text: '¡Hola Carlos! Sí, tenemos 3 unidades en stock. ¿Deseas ordenar 2 conjuntos con un 10% de descuento especial?' },
        { sender: 'user', text: 'Sí, por favor prepara 2 sets. Envío a Bogotá.' }
      ]
    },
    {
      id: '#1002',
      customer: 'Mariana Gómez',
      avatar: '👩',
      phone: '+57 315 234 5678',
      items: '1x Blusa Encaje & Denim Celeste',
      total: '$120 USD',
      time: 'Hace 2 horas',
      status: 'Completado',
      statusClass: 'status-completed',
      dialog: [
        { sender: 'user', text: '¿El envío a Medellín tarda mucho?' },
        { sender: 'bot', text: 'Llega en 24 horas hábiles. Tu guía de rastreo es Servientrega #994821. 🚚' }
      ]
    },
    {
      id: '#1001',
      customer: 'Andrés Silva',
      avatar: '🧑',
      phone: '+57 300 987 6543',
      items: '1x Enterizo Glam Dark Edition',
      total: '$150 USD',
      time: 'Ayer',
      status: 'Completado',
      statusClass: 'status-completed',
      dialog: [
        { sender: 'user', text: 'Gracias por la atención rápida, la prenda llegó perfecta 👌' },
        { sender: 'bot', text: '¡Con mucho gusto Andrés! Gracias por comprar con nosotros. ✨' }
      ]
    }
  ]);


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
        {
          id: 'r5',
          name: 'Tacos Al Pastor Tradicionales',
          category: 'Especialidades',
          price: 12,
          image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'r6',
          name: 'Baby Back Ribs BBQ',
          category: 'Carnes',
          price: 22,
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'r7',
          name: 'Pasta Fettuccine Alfredo & Camarón',
          category: 'Pastas',
          price: 17,
          image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281313?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'r8',
          name: 'Tiramisú Artesanal de la Casa',
          category: 'Postres',
          price: 7,
          image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80',
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
        {
          id: 's5',
          name: 'Corte Executive Fade & Profilado',
          category: 'Cortes',
          price: 20,
          image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 's6',
          name: 'Tratamiento Facial Carbón Activado',
          category: 'Spa',
          price: 14,
          image: 'https://images.unsplash.com/photo-1512290900676-26c2a5a545b6?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 's7',
          name: 'Camuflaje de Canas & Coloración',
          category: 'Color',
          price: 18,
          image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 's8',
          name: 'Kit Cuidado Beard Care Premium',
          category: 'Productos',
          price: 22,
          image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
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
        {
          id: 't5',
          name: 'Teclado Mecánico RGB Custom',
          category: 'Setup',
          price: 85,
          image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 't6',
          name: 'Mouse Ergónomico Wireless Gaming',
          category: 'Periféricos',
          price: 48,
          image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 't7',
          name: 'Mochila Tech Impermeable Antirrobo',
          category: 'Accesorios',
          price: 65,
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 't8',
          name: 'Cámara Web 4K UltraHD Streaming',
          category: 'Video',
          price: 95,
          image: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?auto=format&fit=crop&w=600&q=80',
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
        {
          id: 'p5',
          name: 'Desarrollo de Sitio Web & App',
          category: 'Tecnología',
          price: 450,
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'p6',
          name: 'Estrategia de Marketing Digital 360',
          category: 'Marketing',
          price: 300,
          image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'p7',
          name: 'Automatización de Procesos & CRM',
          category: 'Operaciones',
          price: 380,
          image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'p8',
          name: 'Auditoría Financiera & Presupuesto',
          category: 'Finanzas',
          price: 210,
          image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
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

  readonly activeNicheConfig = computed(() => {
    const nicheId = this.activeNicheId();
    const defaultNiche = this.currentNiche();
    const cfg = this.demoConfig.config();
    const key = nicheId as keyof typeof cfg.niches;
    const custom = cfg.niches?.[key];

    if (custom) {
      return {
        businessTitle: custom.businessTitle || defaultNiche.businessTitle,
        tagline: custom.tagline || defaultNiche.tagline,
        primaryColor: custom.primaryColor || defaultNiche.primaryColor,
        bgColor: custom.bgColor || '#ffffff',
        heroImage: custom.heroImage || defaultNiche.heroImage,
      };
    }

    return {
      businessTitle: defaultNiche.businessTitle,
      tagline: defaultNiche.tagline,
      primaryColor: defaultNiche.primaryColor,
      bgColor: '#ffffff',
      heroImage: defaultNiche.heroImage,
    };
  });

  constructor() {
    // Re-load products whenever config changes (e.g. image swapped in editor)
    effect(() => {
      this.demoConfig.config(); // track changes
      this.loadNicheProducts(this.activeNicheId());
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
    this.demoConfig.setActiveNicheId(nicheId);
    this.cart.set({});
    this.loadNicheProducts(nicheId);
  }

  private loadNicheProducts(nicheId: string): void {
    const niche = this.niches.find((n) => n.id === nicheId) || this.niches[0];
    const products: DemoProduct[] = JSON.parse(JSON.stringify(niche.products));

    const cfg = this.demoConfig.config();
    const key = nicheId as keyof typeof cfg.niches;
    const nicheCfg = cfg.niches?.[key];

    if (nicheCfg && nicheCfg.productImages) {
      products.forEach((p: DemoProduct, idx: number) => {
        if (nicheCfg.productImages[idx]) {
          p.image = nicheCfg.productImages[idx];
        }
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
      id: 'demo-' + Date.now(),
      name,
      category: cat,
      price,
      image: img,
      inStock: true
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

  scrollToHero(): void {
    const hero = document.getElementById('hero');
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

