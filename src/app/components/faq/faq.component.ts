import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SamuelDiagnosisService } from '../../services/samuel-diagnosis.service';
import { ConsultationService } from '../../services/consultation.service';
import { environment } from '../../../environments/environment';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

interface FaqItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, AnimateOnScrollDirective],
  templateUrl: './faq.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .faq-section {
      background-color: #050814;
      color: #F8FAFC;
      position: relative;
      overflow: hidden;
      padding: 6rem 1.5rem 7rem;
      width: 100%;
    }
    .faq-container {
      max-width: 860px;
      margin: 0 auto;
      width: 100%;
      position: relative;
      z-index: 10;
    }
    .faq-header {
      text-align: center;
      margin-bottom: 4rem;
    }
    .faq-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #60A5FA;
      background: rgba(37, 99, 235, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.25);
      padding: 0.4rem 1rem;
      border-radius: 9999px;
      margin-bottom: 1.25rem;
    }
    .faq-title {
      font-family: var(--font-display, 'Outfit', sans-serif) !important;
      font-size: clamp(2.2rem, 4.5vw, 3.5rem);
      font-weight: 800 !important;
      color: #FFFFFF !important;
      line-height: 1.15;
      letter-spacing: -0.025em;
      margin-bottom: 1.25rem;
      text-align: center;
    }
    .faq-highlight {
      background: linear-gradient(135deg, #60A5FA 0%, #38BDF8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .faq-subtitle {
      font-size: 1.05rem;
      color: #94A3B8 !important;
      max-width: 620px;
      margin: 0 auto;
      line-height: 1.6;
      text-align: center;
    }
    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      margin-bottom: 4rem;
    }
    .faq-card {
      width: 100%;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(51, 65, 85, 0.7);
      border-radius: 1.25rem;
      overflow: hidden;
      transition: all 0.25s ease;
      box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.4);
    }
    .faq-card.is-open {
      border-color: rgba(96, 165, 250, 0.6);
      background: rgba(15, 23, 42, 0.95);
      box-shadow: 0 10px 30px -10px rgba(37, 99, 235, 0.25);
    }
    .faq-question-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-align: left;
      padding: 1.4rem 1.75rem;
      gap: 1rem;
      background: transparent;
      border: none;
      cursor: pointer;
      color: #F8FAFC;
      transition: color 0.2s ease;
    }
    .faq-question-btn:hover .faq-q-text {
      color: #60A5FA;
    }
    .faq-q-text {
      font-size: 1.05rem;
      font-weight: 650;
      color: #FFFFFF;
      line-height: 1.4;
      transition: color 0.2s ease;
      font-family: var(--font-display, 'Outfit', sans-serif);
      margin: 0;
    }
    .faq-icon-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #1E293B;
      border: 1px solid #334155;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #94A3B8;
      transition: all 0.25s ease;
    }
    .is-open .faq-icon-circle {
      background: #2563EB;
      border-color: #60A5FA;
      color: #FFFFFF;
      transform: rotate(180deg);
    }
    .faq-answer-panel {
      padding: 0 1.75rem 1.6rem 1.75rem;
      border-top: 1px solid rgba(51, 65, 85, 0.4);
      margin-top: 0.25rem;
      padding-top: 1.25rem;
    }
    .faq-answer-text {
      font-size: 0.95rem;
      color: #CBD5E1 !important;
      line-height: 1.7;
      margin: 0;
    }
    .faq-cta-banner {
      margin-top: 5rem;
      position: relative;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.22) 50%, rgba(15, 23, 42, 0.98) 100%);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 2rem;
      padding: 3.5rem 2rem;
      text-align: center;
      overflow: hidden;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(37, 99, 235, 0.12);
      backdrop-filter: blur(20px);
    }
    .faq-cta-glow {
      position: absolute;
      top: -50px;
      left: 50%;
      transform: translateX(-50%);
      width: 420px;
      height: 200px;
      background: radial-gradient(ellipse, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
      pointer-events: none;
      filter: blur(45px);
    }
    .faq-cta-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 750;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #60A5FA;
      background: rgba(37, 99, 235, 0.18);
      border: 1px solid rgba(96, 165, 250, 0.35);
      padding: 0.45rem 1.15rem;
      border-radius: 9999px;
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 2;
    }
    .faq-cta-title {
      font-family: var(--font-display, 'Outfit', sans-serif) !important;
      font-size: clamp(2rem, 3.8vw, 2.75rem);
      font-weight: 800 !important;
      color: #FFFFFF !important;
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin: 0 auto 1rem auto;
      max-width: 650px;
      position: relative;
      z-index: 2;
    }
    .faq-cta-desc {
      font-size: 1.05rem;
      color: #CBD5E1 !important;
      max-width: 540px;
      margin: 0 auto 2.25rem auto;
      line-height: 1.6;
      position: relative;
      z-index: 2;
    }
    .faq-cta-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      position: relative;
      z-index: 2;
    }
    .faq-btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1.05rem 2.2rem;
      background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
      color: #FFFFFF;
      font-weight: 750;
      font-size: 0.98rem;
      border-radius: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25);
      cursor: pointer;
      transition: all 0.25s ease;
      text-decoration: none;
    }
    .faq-btn-primary:hover {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(37, 99, 235, 0.65);
    }
    .faq-btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1.05rem 2rem;
      background: rgba(15, 23, 42, 0.85);
      color: #F8FAFC;
      font-weight: 650;
      font-size: 0.95rem;
      border-radius: 1rem;
      border: 1px solid rgba(71, 85, 105, 0.7);
      cursor: pointer;
      transition: all 0.25s ease;
      backdrop-filter: blur(8px);
    }
    .faq-btn-secondary:hover {
      background: rgba(30, 41, 59, 0.95);
      border-color: #60A5FA;
      color: #FFFFFF;
      transform: translateY(-2px);
    }
  `]
})
export class FaqComponent {
  samuel = inject(SamuelDiagnosisService);
  consultation = inject(ConsultationService);

  readonly whatsappPhone = environment.whatsappNumber || '3148180949';

  faqs = signal<FaqItem[]>([
    {
      question: '¿Cuánto cuesta desarrollar una página web?',
      answer: 'Los valores varían según las funcionalidades que necesitas. Tenemos tres referencias claras: una Landing Page desde $700.000 COP (~$175 USD, entrega en 7 a 10 días), un Sitio Web Profesional con múltiples páginas y panel administrativo desde $2.500.000 COP (~$625 USD, entrega en 10 a 14 días), y Soluciones Personalizadas (e-commerce, plataformas, sistemas con IA) con cotización según los requerimientos específicos del proyecto.',
      isOpen: false,
    },
    {
      question: '¿Qué solución necesita mi negocio?',
      answer: 'Depende de tu situación actual y tus objetivos. Si apenas necesitas presencia digital, una Landing Page puede ser suficiente. Si quieres posicionar tu marca con múltiples páginas, un Sitio Web Profesional es el paso indicado. Si necesitas vender en línea, gestionar inventario, automatizar procesos o integrar inteligencia artificial, requerirás una solución personalizada. Nuestro asesor virtual Samuel AI puede orientarte en minutos sin costo.',
      isOpen: false,
    },
    {
      question: '¿Puedo contratar si apenas estoy comenzando mi negocio?',
      answer: 'Sí. Trabajamos con negocios en todas las etapas, desde emprendimientos que dan sus primeros pasos hasta empresas consolidadas que quieren modernizar sus procesos. Si estás comenzando, una Landing Page o un Sitio Web Profesional puede darte una presencia digital sólida desde el principio. Si tienes dudas sobre cuál es el mejor punto de partida, podemos agendar una sesión de diagnóstico gratuita.',
      isOpen: false,
    },
    {
      question: '¿Qué incluye cada servicio y qué no incluye?',
      answer: 'Cada propuesta incluye el desarrollo del sitio o sistema acordado, diseño responsivo, entrega del producto según el alcance definido y acompañamiento en la puesta en marcha. Lo que no está incluido por defecto (como el dominio, hosting independiente, mantenimiento mensual o funcionalidades adicionales fuera del alcance) queda claramente especificado antes de firmar cualquier acuerdo. No asumimos compromisos que no estén escritos.',
      isOpen: false,
    },
    {
      question: '¿Cuánto tarda el desarrollo?',
      answer: 'Los plazos dependen del alcance de cada proyecto. Una Landing Page tiene una entrega estimada de 7 a 10 días hábiles. Un Sitio Web Profesional entre 10 y 14 días hábiles. Los proyectos personalizados requieren una evaluación previa para definir el plazo real. Estos plazos aplican una vez tengamos los materiales necesarios por parte del cliente (logo, textos, imágenes, y accesos requeridos).',
      isOpen: false,
    },
    {
      question: '¿Debo pagar dominio y hosting por separado?',
      answer: 'El modelo varía según el proyecto. En algunos casos el dominio y hosting están contemplados en la propuesta; en otros, el cliente los contrata directamente con el proveedor de su preferencia. Este detalle siempre queda definido con claridad en la propuesta comercial antes de comenzar. Si tienes una plataforma de alojamiento preferida, podemos trabajar sobre ella.',
      isOpen: false,
    },
    {
      question: '¿Puedo administrar mis productos y contenido sin depender de SAMTS?',
      answer: 'Sí. Cuando el proyecto incluye un panel administrativo, el cliente puede agregar, editar o eliminar productos, artículos de blog, promociones e imágenes directamente desde su navegador, sin necesitar conocimientos técnicos ni depender de nosotros para los cambios del día a día. La autonomía del cliente es uno de nuestros principios de entrega.',
      isOpen: false,
    },
    {
      question: '¿Puedo recibir pagos por internet?',
      answer: 'Sí, siempre que el proyecto incluya una tienda virtual o un módulo de pagos. La integración con pasarelas de pago (como Wompi, PayU, Stripe u otras) es una funcionalidad que se define en el alcance del proyecto y requiere que el cliente cuente con una cuenta activa en la pasarela correspondiente. Si necesitas esta funcionalidad, es importante mencionarlo desde el diagnóstico inicial.',
      isOpen: false,
    },
    {
      question: '¿Puedo conectar mi web con WhatsApp?',
      answer: 'Sí. La integración con WhatsApp (botón de contacto directo, formularios que envían notificaciones, o agentes de atención por WhatsApp Business) es una de las funcionalidades que podemos implementar. El alcance exacto de la integración depende del proyecto. Si necesitas un agente de IA que atienda clientes por WhatsApp, eso entraría en la categoría de soluciones personalizadas con IA.',
      isOpen: false,
    },
    {
      question: '¿Ofrecen mantenimiento o soporte después de la entrega?',
      answer: 'El acompañamiento posterior a la entrega depende de lo que esté acordado en cada proyecto. La propuesta especificará claramente qué tipo de soporte está contemplado, por cuánto tiempo y bajo qué condiciones. Si necesitas mantenimiento continuo, actualización de contenidos o soporte técnico mensual, podemos definirlo como un servicio adicional.',
      isOpen: false,
    },
    {
      question: '¿Qué ocurre si necesito funcionalidades adicionales después de la entrega?',
      answer: 'Las nuevas funcionalidades fuera del alcance original del proyecto se gestionan como un desarrollo adicional. Evaluamos el requerimiento, definimos el alcance y el valor, y lo ejecutamos de forma independiente. Esto garantiza que el proyecto inicial se entregue en el plazo acordado sin modificaciones constantes que afecten la calidad o las fechas.',
      isOpen: false,
    },
    {
      question: '¿Cómo comienza el proyecto?',
      answer: 'El proceso comienza con una sesión de diagnóstico donde entendemos tus necesidades, objetivos y contexto de negocio. A partir de ahí, definimos el alcance, las funcionalidades, la inversión y el plazo. Una vez acordada la propuesta, iniciamos el desarrollo. No comenzamos a trabajar sin un acuerdo claro por escrito.',
      isOpen: false,
    },
    {
      question: '¿Cómo se realizan los pagos?',
      answer: 'Las condiciones de pago se establecen en cada propuesta comercial. Generalmente se trabaja con un anticipo al inicio del proyecto y el saldo restante en la entrega. Los métodos disponibles y los porcentajes exactos se definen antes de comenzar. No tenemos una política única para todos los proyectos, ya que cada caso tiene características distintas.',
      isOpen: false,
    },
    {
      question: '¿Puedo ampliar mi solución en el futuro?',
      answer: 'Sí. Diseñamos las soluciones pensando en la escalabilidad. Si comienzas con un sitio web profesional y en el futuro necesitas una tienda virtual, un sistema de reservas o integraciones con IA, esos módulos pueden incorporarse sin necesidad de rehacer todo desde cero. Es importante definir desde el principio los planes de crecimiento para que la arquitectura lo permita.',
      isOpen: false,
    },
  ]);

  toggle(index: number): void {
    this.faqs.update(items =>
      items.map((item, i) => ({
        ...item,
        isOpen: i === index ? !item.isOpen : false,
      }))
    );
  }

  startDiagnosis(): void {
    this.samuel.startHome();
  }

  openWhatsApp(): void {
    const text = encodeURIComponent('¡Hola SAMTS! Tengo una duda sobre sus servicios y me gustaría obtener más información.');
    window.open(`https://wa.me/57${this.whatsappPhone}?text=${text}`, '_blank');
  }

  openConsultation(): void {
    this.consultation.open({ source: 'faq' });
  }
}
