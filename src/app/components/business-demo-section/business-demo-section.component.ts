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
  /** Categoría comercial mostrada en el selector de soluciones de la sección */
  category?: string;
  /** Descripción corta de la solución para el selector */
  description?: string;
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

/** ── Demo: Plataforma de entrenadores ── */
export interface CoachClient {
  id: string;
  name: string;
  goal: string;
  avatar: string;
  adherence: number;
  progress: number;
  nextSession: string;
}

export interface CoachExercise {
  name: string;
  sets: string;
  reps: string;
}

export interface CoachRoutine {
  id: string;
  name: string;
  image: string;
  focus: string;
  weeks: string;
  progress: number;
  exercises: CoachExercise[];
}

export interface CoachWeekDay {
  label: string;
  date: number;
  sessions: number;
  today?: boolean;
}

/** ── Demo: Automatizaciones inteligentes ── */
export interface AutomationNode {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  title: string;
  subtitle: string;
  icon: string;
  meta?: string;
}

export interface AutomationRun {
  id: string;
  time: string;
  status: 'success' | 'error' | 'warning';
  duration: string;
  detail: string;
}

export interface AutomationFlow {
  id: string;
  name: string;
  category: string;
  active: boolean;
  runs: number;
  lastRun: string;
  successRate: number;
  nodes: AutomationNode[];
  history: AutomationRun[];
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
      name: 'Tienda virtual',
      icon: 'pi-shopping-bag',
      category: 'E-commerce',
      description: 'Tienda online premium con catálogo editorial, filtros, carrito y pedido por WhatsApp.',
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
      name: 'Restaurante',
      icon: 'pi-apple',
      category: 'Gastronomía',
      description: 'Web gastronómica editorial con menú visual, categorías de platos y reservas en línea.',
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
      name: 'Barbería',
      icon: 'pi-star',
      category: 'Servicios con cita',
      description: 'Reserva de citas con selección de servicio, especialista, fecha y horario en vivo.',
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
      name: 'Tienda tech',
      icon: 'pi-box',
      category: 'E-commerce',
      description: 'Catálogo de productos con ofertas, variantes, disponibilidad y compra inmediata.',
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
      name: 'Estudio de diseño',
      icon: 'pi-user',
      category: 'Servicios creativos',
      description: 'Portafolio de servicios profesionales con paquetes, precios y contacto directo.',
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
    {
      id: 'coaches',
      name: 'Plataforma de entrenadores',
      icon: 'pi-heart',
      category: 'Software a medida',
      description: 'Plataforma para entrenadores: rutinas, seguimiento, progreso y calendario de clientes.',
      businessTitle: 'Pulse Coaching',
      tagline: 'Entrena más clientes con seguimiento real · Plataforma para entrenadores y sus atletas',
      badge: 'Coach Platform',
      heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80',
      primaryColor: '#0f1115',
      products: [
        {
          id: 'c1',
          name: 'Plan Fuerza & Hipertrofia',
          category: 'Programas',
          subtitle: '12 semanas · 4 sesiones por semana',
          price: 89,
          image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
        {
          id: 'c2',
          name: 'Plan Movilidad & Core',
          category: 'Programas',
          subtitle: '8 semanas · 3 sesiones por semana',
          price: 69,
          image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
          inStock: true,
        },
      ],
    },
    {
      id: 'automations',
      name: 'Automatizaciones',
      icon: 'pi-bolt',
      category: 'Software a medida',
      description: 'Constructor visual de flujos: disparadores, acciones, estado y historial de ejecuciones.',
      businessTitle: 'Flux Automation',
      tagline: 'Conecta, dispara y automatiza · Flujos visuales que trabajan por tu negocio 24/7',
      badge: 'Workflow Builder',
      heroImage: '',
      primaryColor: '#4f46e5',
      products: [
        {
          id: 'a1',
          name: 'Pedido entrante → CRM',
          category: 'Ventas',
          subtitle: 'Crea el registro y confirma por mensaje',
          price: 0,
          image: '',
          inStock: true,
        },
        {
          id: 'a2',
          name: 'Recordatorio de cita',
          category: 'Operación',
          subtitle: 'Avisa 24 h antes al cliente',
          price: 0,
          image: '',
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

  // ════════════════════════════════════════════════════════════════
  // PRESENTACIÓN DE LA SECCIÓN — selector visual de soluciones
  // ════════════════════════════════════════════════════════════════

  /** Solución activa con todos sus metadatos de presentación. */
  readonly activeSolution = computed<DemoNiche>(() => {
    return this.niches.find((n) => n.id === this.activeNicheId()) || this.niches[0];
  });

  /** Categorías únicas de las soluciones, para el selector visual. */
  readonly solutionCategories = computed<string[]>(() => {
    const cats: string[] = [];
    for (const n of this.niches) {
      if (n.category && !cats.includes(n.category)) cats.push(n.category);
    }
    return cats;
  });

  scrollToSimulator(): void {
    const el = document.getElementById('demo-simulator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /** CTA comercial: abre el modal de consultoría con el contexto de la demo. */
  requestSimilarSolution(): void {
    const s = this.activeSolution();
    this.modalService.open({
      solutionInterest: s.name,
      mainProblem: s.description || s.tagline,
      source: 'home_demo_section',
    });
  }

  // ════════════════════════════════════════════════════════════════
  // DEMO: PLATAFORMA DE ENTRENADORES (Pulse Coaching)
  // Datos demostrativos — no representan información real de clientes.
  // ════════════════════════════════════════════════════════════════

  readonly coachNav = [
    { id: 'panel', label: 'Panel', icon: 'pi-th-large', badge: '' },
    { id: 'rutinas', label: 'Rutinas', icon: 'pi-list', badge: '2' },
    { id: 'clientes', label: 'Clientes', icon: 'pi-users', badge: '24' },
    { id: 'calendario', label: 'Calendario', icon: 'pi-calendar', badge: '' },
    { id: 'progreso', label: 'Progreso', icon: 'pi-chart-line', badge: '' },
    { id: 'mensajes', label: 'Mensajes', icon: 'pi-comments', badge: '3' },
  ];

  readonly coachKpis = [
    { id: 'k1', label: 'Clientes activos', value: '24', delta: '+3 este mes', icon: 'pi-users', ring: 62 },
    { id: 'k2', label: 'Sesiones esta semana', value: '68', delta: '+12%', icon: 'pi-calendar-plus', ring: 48 },
    { id: 'k3', label: 'Adherencia promedio', value: '87%', delta: '+4 pts', icon: 'pi-chart-line', ring: 87 },
    { id: 'k4', label: 'Ingresos del mes', value: '$4.280', delta: 'demo', icon: 'pi-wallet', ring: 71 },
  ];

  readonly coachClients: CoachClient[] = [
    {
      id: 'cl1',
      name: 'Camila Torres',
      goal: 'Pérdida de grasa',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      adherence: 92,
      progress: 74,
      nextSession: 'Hoy · 18:00',
    },
    {
      id: 'cl2',
      name: 'Daniel Ríos',
      goal: 'Hipertrofia',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      adherence: 81,
      progress: 58,
      nextSession: 'Mañana · 07:00',
    },
    {
      id: 'cl3',
      name: 'Laura Méndez',
      goal: 'Fuerza y movilidad',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      adherence: 88,
      progress: 66,
      nextSession: 'Jue · 09:30',
    },
    {
      id: 'cl4',
      name: 'Andrés Peña',
      goal: 'Rendimiento deportivo',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      adherence: 76,
      progress: 49,
      nextSession: 'Vie · 19:00',
    },
  ];

  selectedCoachClient = signal<CoachClient>(this.coachClients[0]);

  /** Sección activa del panel de la demo de entrenadores. */
  coachActiveTab = signal<string>('panel');

  readonly coachRoutines: CoachRoutine[] = [
    {
      id: 'r1',
      name: 'Fuerza — Tren inferior',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
      focus: 'Potencia y estabilidad',
      weeks: 'Semana 5 de 12',
      progress: 42,
      exercises: [
        { name: 'Sentadilla con barra', sets: '4', reps: '8' },
        { name: 'Peso muerto rumano', sets: '3', reps: '10' },
        { name: 'Zancadas búlgaras', sets: '3', reps: '12' },
      ],
    },
    {
      id: 'r2',
      name: 'Movilidad & Core',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
      focus: 'Control y rango',
      weeks: 'Semana 3 de 8',
      progress: 68,
      exercises: [
        { name: 'Plancha con peso', sets: '4', reps: '40s' },
        { name: 'Pallof press', sets: '3', reps: '12' },
        { name: 'Dead bug', sets: '3', reps: '15' },
      ],
    },
  ];

  readonly coachWeekDays: CoachWeekDay[] = [
    { label: 'Lun', date: 3, sessions: 4 },
    { label: 'Mar', date: 4, sessions: 2 },
    { label: 'Mié', date: 5, sessions: 3, today: true },
    { label: 'Jue', date: 6, sessions: 5 },
    { label: 'Vie', date: 7, sessions: 2 },
    { label: 'Sáb', date: 8, sessions: 1 },
    { label: 'Dom', date: 9, sessions: 0 },
  ];

  readonly coachActivity = [
    { id: 'a1', text: 'Camila completó «Fuerza — Tren inferior»', time: 'Hace 12 min', icon: 'pi-check-circle', tone: 'ok' },
    { id: 'a2', text: 'Daniel actualizó su peso corporal (-0.8 kg)', time: 'Hace 1 h', icon: 'pi-chart-line', tone: 'info' },
    { id: 'a3', text: 'Laura agendó sesión para el jueves', time: 'Hace 3 h', icon: 'pi-calendar', tone: 'info' },
    { id: 'a4', text: 'Andrés no registró la rutina de ayer', time: 'Ayer', icon: 'pi-exclamation-circle', tone: 'warn' },
  ];

  /** Serie de progreso demostrativa (semana a semana). */
  readonly coachTrend = [
    { label: 'S1', value: 42 },
    { label: 'S2', value: 48 },
    { label: 'S3', value: 55 },
    { label: 'S4', value: 61 },
    { label: 'S5', value: 58 },
    { label: 'S6', value: 67 },
    { label: 'S7', value: 74 },
    { label: 'S8', value: 81 },
  ];

  /** Geometría SVG del gráfico de tendencia (viewBox 0 0 320 120). */
  readonly coachTrendChart = computed(() => {
    const w = 320;
    const h = 120;
    const pad = 10;
    const values = this.coachTrend.map((d) => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const span = max - min || 1;
    const step = (w - pad * 2) / (this.coachTrend.length - 1);
    const pts = this.coachTrend.map((d, i) => {
      const x = pad + i * step;
      const y = h - pad - ((d.value - min) / span) * (h - pad * 2);
      return { x, y };
    });
    const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const area = `${pad},${h - pad} ${line} ${(w - pad).toFixed(1)},${h - pad}`;
    const last = pts[pts.length - 1];
    return { line, area, lastX: last.x.toFixed(1), lastY: last.y.toFixed(1) };
  });

  /** Tono semántico derivado de la adherencia del cliente (demo). */
  coachClientTone(client: CoachClient): string {
    if (client.adherence >= 85) return 'ok';
    if (client.adherence >= 70) return 'warn';
    return 'risk';
  }

  /** Etiqueta de estado derivada de la adherencia del cliente (demo). */
  coachClientStatus(client: CoachClient): string {
    if (client.adherence >= 85) return 'Al día';
    if (client.adherence >= 70) return 'Atención';
    return 'En riesgo';
  }

  selectCoachClient(client: CoachClient): void {
    this.selectedCoachClient.set(client);
  }

  // ════════════════════════════════════════════════════════════════
  // DEMO: AUTOMATIZACIONES INTELIGENTES (Flux Automation)
  // Flujos demostrativos — no representan integraciones externas reales.
  // ════════════════════════════════════════════════════════════════

  readonly automationFlows = signal<AutomationFlow[]>([
    {
      id: 'flow-1',
      name: 'Pedido entrante → CRM',
      category: 'Ventas',
      active: true,
      runs: 1284,
      lastRun: 'Hace 2 min',
      successRate: 98,
      nodes: [
        { id: 'n1', type: 'trigger', title: 'Nuevo pedido', subtitle: 'Se recibe un pedido nuevo', icon: 'pi-shopping-cart', meta: 'Disparador' },
        { id: 'n2', type: 'condition', title: '¿Pago confirmado?', subtitle: 'Verifica el estado del pago', icon: 'pi-verified', meta: 'Condición' },
        { id: 'n3', type: 'action', title: 'Crear registro en CRM', subtitle: 'Alta del cliente y del pedido', icon: 'pi-database', meta: 'Acción' },
        { id: 'n4', type: 'action', title: 'Enviar confirmación', subtitle: 'Mensaje al cliente', icon: 'pi-send', meta: 'Acción' },
      ],
      history: [
        { id: 'h1', time: 'Hoy · 09:42', status: 'success', duration: '1.2 s', detail: 'Pedido #1042 procesado' },
        { id: 'h2', time: 'Hoy · 09:18', status: 'success', duration: '0.9 s', detail: 'Pedido #1041 procesado' },
        { id: 'h3', time: 'Hoy · 08:55', status: 'warning', duration: '2.4 s', detail: 'Reintento por latencia interna' },
      ],
    },
    {
      id: 'flow-2',
      name: 'Recordatorio de cita',
      category: 'Operación',
      active: true,
      runs: 642,
      lastRun: 'Hace 26 min',
      successRate: 100,
      nodes: [
        { id: 'n1', type: 'trigger', title: '24 h antes de la cita', subtitle: 'Se dispara por fecha', icon: 'pi-clock', meta: 'Disparador' },
        { id: 'n2', type: 'action', title: 'Enviar recordatorio', subtitle: 'Mensaje con fecha y hora', icon: 'pi-bell', meta: 'Acción' },
        { id: 'n3', type: 'action', title: 'Marcar como notificada', subtitle: 'Actualiza el estado', icon: 'pi-check', meta: 'Acción' },
      ],
      history: [
        { id: 'h1', time: 'Hoy · 08:30', status: 'success', duration: '0.6 s', detail: '12 recordatorios enviados' },
        { id: 'h2', time: 'Ayer · 20:00', status: 'success', duration: '0.7 s', detail: '8 recordatorios enviados' },
      ],
    },
    {
      id: 'flow-3',
      name: 'Reposición de inventario',
      category: 'Inventario',
      active: false,
      runs: 219,
      lastRun: 'Hace 3 días',
      successRate: 91,
      nodes: [
        { id: 'n1', type: 'trigger', title: 'Stock bajo mínimo', subtitle: 'Se detecta stock crítico', icon: 'pi-box', meta: 'Disparador' },
        { id: 'n2', type: 'condition', title: '¿Supera el umbral?', subtitle: 'Valida la cantidad mínima', icon: 'pi-sliders-h', meta: 'Condición' },
        { id: 'n3', type: 'action', title: 'Crear alerta interna', subtitle: 'Notifica al equipo', icon: 'pi-bell', meta: 'Acción' },
      ],
      history: [
        { id: 'h1', time: 'Hace 3 días', status: 'success', duration: '1.0 s', detail: '3 productos marcados para reposición' },
        { id: 'h2', time: 'Hace 6 días', status: 'error', duration: '—', detail: 'Regla pausada por el usuario' },
      ],
    },
  ]);

  selectedAutomationId = signal<string>('flow-1');
  /** Estado de carga mientras se "ejecuta" un flujo (solo demostración visual). */
  readonly automationRunning = signal(false);
  /** Búsqueda por nombre/categoría en la lista de flujos (UI del constructor). */
  readonly automationSearch = signal('');
  /** Filtro de estado de la lista de flujos (UI del constructor). */
  readonly automationFilter = signal<'all' | 'active' | 'paused'>('all');
  /** Nodo inspeccionado en el lienzo (null = se muestra el resumen del flujo). */
  readonly selectedAutomationNodeId = signal<string | null>(null);

  readonly activeAutomation = computed<AutomationFlow>(() => {
    const flows = this.automationFlows();
    return flows.find((f) => f.id === this.selectedAutomationId()) || flows[0];
  });

  /** Nodo seleccionado dentro del lienzo (o null si no hay inspección activa). */
  readonly selectedAutomationNode = computed<AutomationNode | null>(() => {
    const id = this.selectedAutomationNodeId();
    if (!id) return null;
    return this.activeAutomation().nodes.find((n) => n.id === id) || null;
  });

  /** Contexto del nodo inspeccionado: posición y conexiones dentro del flujo. */
  readonly selectedAutomationNodeContext = computed<{
    node: AutomationNode;
    position: number;
    total: number;
    prev: AutomationNode | null;
    next: AutomationNode | null;
  } | null>(() => {
    const node = this.selectedAutomationNode();
    if (!node) return null;
    const nodes = this.activeAutomation().nodes;
    const index = nodes.findIndex((n) => n.id === node.id);
    return {
      node,
      position: index + 1,
      total: nodes.length,
      prev: index > 0 ? nodes[index - 1] : null,
      next: index < nodes.length - 1 ? nodes[index + 1] : null,
    };
  });

  /** Totales del panel de automatizaciones (datos demostrativos). */
  readonly automationTotals = computed(() => {
    const flows = this.automationFlows();
    return {
      count: flows.length,
      active: flows.filter((f) => f.active).length,
      runs: flows.reduce((sum, f) => sum + f.runs, 0),
    };
  });

  selectAutomation(id: string): void {
    this.selectedAutomationId.set(id);
    this.selectedAutomationNodeId.set(null);
  }

  /** ¿El flujo coincide con el filtro de estado y la búsqueda actuales? */
  automationMatchesSearch(flow: AutomationFlow): boolean {
    const filter = this.automationFilter();
    if (filter === 'active' && !flow.active) return false;
    if (filter === 'paused' && flow.active) return false;
    const query = this.automationSearch().trim().toLowerCase();
    if (!query) return true;
    return `${flow.name} ${flow.category}`.toLowerCase().includes(query);
  }

  /** Selecciona o des-selecciona un nodo del lienzo para inspeccionarlo. */
  selectAutomationNode(id: string): void {
    this.selectedAutomationNodeId.update((current) => (current === id ? null : id));
  }

  toggleAutomation(id: string, event?: Event): void {
    event?.stopPropagation();
    this.automationFlows.update((flows) =>
      flows.map((f) => (f.id === id ? { ...f, active: !f.active } : f))
    );
  }

  runAutomationNow(): void {
    if (this.automationRunning()) return;
    this.automationRunning.set(true);

    const flow = this.activeAutomation();
    const stamp = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const run: AutomationRun = {
      id: 'run-' + Date.now(),
      time: `Hoy · ${stamp}`,
      status: 'success',
      duration: '0.8 s',
      detail: 'Ejecución manual completada',
    };
    this.automationFlows.update((flows) =>
      flows.map((f) =>
        f.id === flow.id
          ? { ...f, runs: f.runs + 1, lastRun: 'Hace unos segundos', history: [run, ...f.history] }
          : f
      )
    );
    this.triggerAdminToast(`⚡ Flujo «${flow.name}» ejecutado (demostración)`);

    setTimeout(() => this.automationRunning.set(false), 900);
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
    });
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
    } else if (bType.includes('entrenad') || bType.includes('coach') || bType.includes('fitness') || bType.includes('gimnasio') || bType.includes('gym')) {
      nicheId = 'coaches';
    } else if (bType.includes('automatiz') || bType.includes('flujo') || bType.includes('workflow')) {
      nicheId = 'automations';
    }

    this.activeNicheId.set(nicheId);
    this.demoConfig.setActiveNicheId(nicheId);
    this.loadNicheProducts(nicheId);
  }

  /** Selecciona el primer nicho de una categoría dada. */
  setCategory(cat: string): void {
    const firstNiche = this.niches.find(n => n.category === cat);
    if (firstNiche) {
      this.setNiche(firstNiche.id);
    }
  }

  setNiche(nicheId: string): void {
    this.activeNicheId.set(nicheId);
    this.demoConfig.setActiveNicheId(nicheId);
    this.cart.set({});
    // Los rubros que no son de comercio no tienen panel administrativo de catálogo:
    // forzamos la vista cliente para no mostrar una pantalla sin sentido.
    if (nicheId === 'coaches' || nicheId === 'automations') {
      this.viewMode.set('client');
    }
    this.loadNicheProducts(nicheId);
  }

  /** Rubros que sí cuentan con panel administrativo de catálogo/pedidos. */
  readonly isCommerceNiche = computed(() => {
    const id = this.activeNicheId();
    return id !== 'coaches' && id !== 'automations';
  });

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

