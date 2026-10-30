import { Component, Input, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SolutionPlan } from '../../core/models/samuel.models';
import { SamuelDiagnosisService } from '../../services/samuel-diagnosis.service';
import { ConsultationService } from '../../services/consultation.service';
import { BOUTIQUE_ASSETS } from '../../data/boutique-assets.data';
import { cdnUrl } from '../../core/cdn';
import { DemoConfigService } from '../../services/demo-config.service';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';
import { CdnPipe } from '../../core/cdn';

export interface DemoProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  discountPercent?: string;
  rating?: number;
  subtitle?: string;
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

export interface BarberServiceItem {
  id: string;
  name: string;
  price: number;
  duration: string;
  included: string;
}

export interface BarberStaffItem {
  id: string;
  name: string;
  rating: number;
  avatar: string;
  specialty: string;
}

@Component({
  selector: 'app-business-demo-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AnimateOnScrollDirective, CdnPipe],
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
  settingsBusinessName = signal<string>('Rosant');
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
      businessTitle: 'Rosant',
      tagline: 'Tu marca, tu estilo, tu esencia',
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
      heroImage: cdnUrl('/images/restaurant/hero-pasta-v2.jpg'),
      primaryColor: '#c99b53',
      products: [
        {
          id: 'r1',
          name: 'Tagliatelle al Tartufo & Funghi',
          category: 'Pastas de Autor',
          price: 28,
          image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'r2',
          name: 'Risotto Dorado alla Milanese',
          category: 'Risottos',
          price: 26,
          image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'r3',
          name: 'Medallón de Res Rossini',
          category: 'Carnes Nobles',
          price: 34,
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'r4',
          name: 'Lubina Salvaje al Azafrán',
          category: 'Pescados & Mariscos',
          price: 32,
          image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'r5',
          name: 'Salmón Noruego al Fuego de Leña',
          category: 'Especialidades',
          price: 34,
          image: cdnUrl('/images/restaurant/specialty-salmon-v2.jpg'),
          inStock: true,
        },
        {
          id: 'r6',
          name: 'Filet Mignon & Reducción de Oporto',
          category: 'Carnes',
          price: 38,
          image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'r7',
          name: 'Pasta Fresca al Pomodoro & Albahaca',
          category: 'Pastas',
          price: 24,
          image: cdnUrl('/images/restaurant/hero-pasta-v2.jpg'),
          inStock: true,
        },
        {
          id: 'r8',
          name: 'Mille-Feuille de Frutos Rojos',
          category: 'Postres de Autor',
          price: 18,
          image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
      ],
    },
    {
      id: 'barbershop',
      name: 'Barbería & Spa',
      icon: 'pi-star',
      businessTitle: 'Barbería Exclusiva',
      tagline: 'Cortes de autor, rituales de toalla caliente y perfilado al detalle. Reserva tu turno en segundos.',
      badge: 'Citas & Servicios',
      heroImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#c99b53',
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
          oldPrice: 85,
          discountPercent: '-7%',
          rating: 5,
          image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 't2',
          name: 'Smart 360 Vision Tripod Cam',
          category: 'Cámaras',
          price: 80,
          oldPrice: 95,
          rating: 5,
          image: cdnUrl('/images/tech/emetix-bento-camera-v2.jpg'),
          inStock: true,
        },
        {
          id: 't3',
          name: 'Smartwatch Serie Ultra Sport',
          category: 'Wearables',
          price: 80,
          oldPrice: 110,
          rating: 5,
          image: cdnUrl('/images/tech/emetix-bento-smartwatch-v2.jpg'),
          inStock: true,
        },
        {
          id: 't4',
          name: 'Studio Master Wireless ANC Headset',
          category: 'Audio',
          price: 120,
          oldPrice: 150,
          rating: 5,
          image: cdnUrl('/images/tech/emetix-bento-headphones-v2.jpg'),
          inStock: true,
        },
        {
          id: 't5',
          name: 'Flagship Smartphone Red Edition',
          category: 'Smartphones',
          price: 98,
          oldPrice: 130,
          rating: 5,
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 't6',
          name: 'Smartwatch Pulse Digital Tracker',
          category: 'Wearables',
          price: 98,
          oldPrice: 125,
          rating: 5,
          image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 't7',
          name: 'Portable Sound Cylinder Metal',
          category: 'Audio',
          price: 89,
          oldPrice: 100,
          discountPercent: '-10%',
          rating: 5,
          image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 't8',
          name: 'Smart Desktop Appliance & Hub',
          category: 'Smart Home',
          price: 98,
          oldPrice: 119,
          rating: 5,
          image: 'https://images.unsplash.com/photo-1584285418504-0050ec44b4b7?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 't9',
          name: 'Wireless Deep Bass Headphones Blue',
          category: 'Audio',
          price: 85,
          oldPrice: 110,
          rating: 5,
          image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 't10',
          name: 'Amazon Echo Smart Assistant Hub',
          category: 'Smart Home',
          price: 120,
          oldPrice: 140,
          rating: 5,
          image: cdnUrl('/images/tech/emetix-bento-speaker-v2.jpg'),
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
          subtitle: 'Sistema visual completo, tipografía, paleta y manual de marca escalable.',
          price: 1800,
          image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'p2',
          name: 'High-Converting Web & UI Design',
          category: 'Web & UI',
          subtitle: 'Diseño web refinado de alta conversión en Figma y desarrollo moderno.',
          price: 2400,
          image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'p3',
          name: 'Design System & Frontend Handoff',
          category: 'Sistemas',
          subtitle: 'Biblioteca de componentes atómicos documentados listos para producción.',
          price: 1600,
          image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'p4',
          name: 'Fractional Design Partner (Retainer)',
          category: 'Acompañamiento',
          subtitle: 'Liderazgo de diseño dedicado para startups y equipos creativos.',
          price: 3200,
          image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'p5',
          name: 'SaaS Experience & Mobile App UI',
          category: 'Producto',
          subtitle: 'Flujos intuitivos de onboarding, dashboards complejos y diseño mobile.',
          price: 2900,
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'p6',
          name: 'Sprint de Consultoría Creativa',
          category: 'Estrategia',
          subtitle: 'Auditoría express de UX, benchmarking y roadmap de optimización de conversión.',
          price: 1200,
          image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
      ],
    },
  ];

  editableProducts = signal<DemoProduct[]>([]);
  boutiqueActiveTab = signal<string>('todos');
  techActiveTab = signal<'latest' | 'bestseller' | 'featured'>('latest');

  filteredTechProducts = computed(() => {
    const list = this.editableProducts();
    const tab = this.techActiveTab();
    if (tab === 'bestseller') {
      return [...list].reverse();
    }
    if (tab === 'featured') {
      return list.filter((_, idx) => idx % 2 === 0);
    }
    return list;
  });

  scrollToSevServices(): void {
    const el = document.getElementById('sev-services-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ─── Barbería: Servicios y Agendamiento ───
  readonly barberServices: BarberServiceItem[] = [
    {
      id: 'srv-corte',
      name: 'Corte de Cabello',
      price: 15,
      duration: '30 min',
      included: 'Lavado, corte personalizado, toalla caliente y styling premium',
    },
    {
      id: 'srv-barba',
      name: 'Ritual de Barba',
      price: 12,
      duration: '25 min',
      included: 'Vapor de ozono, aceites esenciales, navaja y toalla caliente',
    },
    {
      id: 'srv-corte-barba',
      name: 'Corte + Barba',
      price: 24,
      duration: '50 min',
      included: 'Experiencia completa con toalla tibia y perfilado milimétrico',
    },
    {
      id: 'srv-cejas',
      name: 'Perfilado de Cejas',
      price: 6,
      duration: '15 min',
      included: 'Diseño anatómico y perfilado limpio a navaja clásica',
    },
    {
      id: 'srv-combo-full',
      name: 'Corte + Barba + Cejas',
      price: 28,
      duration: '65 min',
      included: 'El servicio insignia: corte, barba, cejas y mascarilla revitalizante',
    },
  ];

  readonly barberStaff: BarberStaffItem[] = [
    {
      id: 'barber-lucas',
      name: 'Lucas Ferreira',
      rating: 4.9,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      specialty: 'Master Barber · Fade & Diseños',
    },
    {
      id: 'barber-gabriel',
      name: 'Gabriel Santos',
      rating: 4.8,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      specialty: 'Especialista en Barbas & Afeitado',
    },
    {
      id: 'barber-rafael',
      name: 'Rafael Lima',
      rating: 4.9,
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
      specialty: 'Cortes Ejecutivos & Textura',
    },
    {
      id: 'barber-matheus',
      name: 'Matheus Alves',
      rating: 4.7,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      specialty: 'Estilo Urbano & Coloración',
    },
  ];

  selectedBarberService = signal<BarberServiceItem>(this.barberServices[0]);
  selectedBarber = signal<BarberStaffItem>(this.barberStaff[0]);
  selectedBarberDay = signal<number>(22);
  selectedBarberMonthYear = signal<string>('Mayo 2026');
  selectedBarberTime = signal<string>('16:00');

  readonly barberTimeSlots: string[] = [
    '09:00', '10:00', '11:00',
    '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00'
  ];

  readonly barberCalendarDays = [
    { day: 27, inCurrentMonth: false },
    { day: 28, inCurrentMonth: false },
    { day: 29, inCurrentMonth: false },
    { day: 30, inCurrentMonth: false },
    { day: 1, inCurrentMonth: true },
    { day: 2, inCurrentMonth: true },
    { day: 3, inCurrentMonth: true },
    { day: 4, inCurrentMonth: true },
    { day: 5, inCurrentMonth: true },
    { day: 6, inCurrentMonth: true },
    { day: 7, inCurrentMonth: true },
    { day: 8, inCurrentMonth: true },
    { day: 9, inCurrentMonth: true },
    { day: 10, inCurrentMonth: true },
    { day: 11, inCurrentMonth: true },
    { day: 12, inCurrentMonth: true },
    { day: 13, inCurrentMonth: true },
    { day: 14, inCurrentMonth: true },
    { day: 15, inCurrentMonth: true },
    { day: 16, inCurrentMonth: true },
    { day: 17, inCurrentMonth: true },
    { day: 18, inCurrentMonth: true },
    { day: 19, inCurrentMonth: true },
    { day: 20, inCurrentMonth: true },
    { day: 21, inCurrentMonth: true },
    { day: 22, inCurrentMonth: true },
    { day: 23, inCurrentMonth: true },
    { day: 24, inCurrentMonth: true },
    { day: 25, inCurrentMonth: true },
    { day: 26, inCurrentMonth: true },
    { day: 27, inCurrentMonth: true },
    { day: 28, inCurrentMonth: true },
    { day: 29, inCurrentMonth: true },
    { day: 30, inCurrentMonth: true },
    { day: 31, inCurrentMonth: true },
  ];

  selectBarberService(service: BarberServiceItem): void {
    this.selectedBarberService.set(service);
  }

  selectBarber(barber: BarberStaffItem): void {
    this.selectedBarber.set(barber);
  }

  selectBarberDay(day: number): void {
    this.selectedBarberDay.set(day);
  }

  selectBarberTime(time: string): void {
    this.selectedBarberTime.set(time);
  }

  confirmBarberBooking(): void {
    this.openWhatsAppMessagePreview();
  }

  scrollToBarberBooking(): void {
    const el = document.getElementById('barber-booking-widget');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      this.openWhatsAppMessagePreview();
    }
  }

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

    const fallbackPrimary = (defaultNiche as any).primaryColor || '#c99b53';
    const fallbackAccent = (defaultNiche as any).accentColor || '#e5a852';
    const fallbackBg = (defaultNiche as any).bgColor || (nicheId === 'restaurant' ? '#0a0a0c' : (nicheId === 'barbershop' ? '#0a0a0c' : '#ffffff'));

    return {
      businessTitle: custom?.businessTitle || defaultNiche.businessTitle,
      tagline: custom?.tagline || defaultNiche.tagline,
      primaryColor: custom?.primaryColor || fallbackPrimary,
      accentColor: custom?.accentColor || fallbackAccent,
      bgColor: custom?.bgColor || fallbackBg,
      heroImage: custom?.heroImage || defaultNiche.heroImage,
    };
  });

  readonly sevHeadline = computed(() => {
    const raw = this.activeNicheConfig().tagline || 'Design Better, Faster, Smarter · Refined brands, websites & interfaces';
    const parts = raw.split(/\s*[·•|]\s*/);
    const titleFull = parts[0]?.trim() || 'Design Better, Faster, Smarter';
    const bio = parts.slice(1).join(' · ').trim() || 'I design refined brands, websites, and interfaces for ambitious founders and creative teams.';

    const commaIndex = titleFull.indexOf(',');
    let primaryText = titleFull;
    let mutedText = '';

    if (commaIndex !== -1 && commaIndex < titleFull.length - 1) {
      primaryText = titleFull.substring(0, commaIndex).trim();
      mutedText = titleFull.substring(commaIndex + 1).replace(/^,*\s*/, '').trim();
    } else {
      const words = titleFull.split(/\s+/);
      if (words.length >= 3) {
        primaryText = words.slice(0, Math.ceil(words.length / 2)).join(' ');
        mutedText = words.slice(Math.ceil(words.length / 2)).join(' ');
      }
    }

    return { primaryText, mutedText, bio };
  });

  readonly isSevDarkBg = computed(() => {
    const bg = (this.activeNicheConfig().bgColor || '').toLowerCase();
    if (bg.startsWith('#')) {
      const hex = bg.replace('#', '');
      if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luma < 128;
      }
    }
    return false;
  });

  constructor() {
    // Sync activeNicheId and reload products when config changes
    effect(() => {
      const cfg = this.demoConfig.config();
      if (cfg.activeNicheId && cfg.activeNicheId !== this.activeNicheId()) {
        this.activeNicheId.set(cfg.activeNicheId);
      }
      this.loadNicheProducts(this.activeNicheId());
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.selectInitialNiche();
  }

  private selectInitialNiche(): void {
    const bType = (this.initialBusinessType || this.samuel.answers().businessType || '').toLowerCase();
    let nicheId = 'boutique';
    if (bType.includes('ropa') || bType.includes('boutique') || bType.includes('moda')) {
      nicheId = 'boutique';
    } else if (bType.includes('restaurante') || bType.includes('comida') || bType.includes('café')) {
      nicheId = 'restaurant';
    } else if (bType.includes('barber') || bType.includes('corte') || bType.includes('spa')) {
      nicheId = 'barbershop';
    } else if (bType.includes('servicio') || bType.includes('empresa') || bType.includes('consultor')) {
      nicheId = 'services';
    } else if (bType.includes('producto') || bType.includes('tienda')) {
      nicheId = 'products';
    }

    this.activeNicheId.set(nicheId);
    this.demoConfig.setActiveNicheId(nicheId);
    this.loadNicheProducts(nicheId);
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

    if (niche.id === 'barbershop') {
      const srv = this.selectedBarberService();
      const brb = this.selectedBarber();
      const day = this.selectedBarberDay();
      const my = this.selectedBarberMonthYear();
      const time = this.selectedBarberTime();
      return (
        `¡Hola! 👋 Deseo agendar mi cita en *${this.activeNicheConfig().businessTitle}*:\n\n` +
        `✂ *Servicio:* ${srv.name} ($${srv.price} USD)\n` +
        `👤 *Barbero asignado:* ${brb.name}\n` +
        `📅 *Fecha:* ${day} de ${my}\n` +
        `⏰ *Horario:* ${time}\n` +
        `⏳ *Duración estimada:* ${srv.duration}\n` +
        `💰 *Total:* $${srv.price} USD\n\n` +
        `¿Me confirman disponibilidad para este turno? ¡Muchas gracias!`
      );
    }

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
    const phone = '573148180949';
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }

  openWhatsAppBooking(): void {
    const text = encodeURIComponent('¡Hola SAMTS! 👋 Me gustaría agendar una llamada / asesoría para conocer más sobre sus servicios para mi negocio.');
    window.open('https://wa.me/573148180949?text=' + text, '_blank');
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

