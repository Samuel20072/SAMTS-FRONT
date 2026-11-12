import { Component, signal, ViewChild, ElementRef, AfterViewChecked, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AiSettingsService } from '../../../services/api/ai-settings.service';
import { PromotionsService } from '../../../services/api/promotions.service';
import { BlogPostsService } from '../../../services/api/blog-posts.service';
import { AiGenerationService } from '../../../services/api/ai-generation.service';
import { AuthService } from '../../../services/api/auth.service';

interface ChatMessage {
  text: string;
  sender: 'ai' | 'admin';
  time: string;
  type?: 'text' | 'action';
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, FormsModule],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent implements OnInit, AfterViewChecked {
  @ViewChild('copilotScroll') private copilotScrollContainer!: ElementRef;

  aiSettingsService = inject(AiSettingsService);
  promotionsService = inject(PromotionsService);
  blogPostsService = inject(BlogPostsService);
  aiGenerationService = inject(AiGenerationService);
  authService = inject(AuthService);
  router = inject(Router);

  sidebarOpen = signal(true);
  copilotOpen = signal(false);
  isCopilotTyping = signal(false);
  copilotInput = '';

  aiSettings = signal<any>(null);
  pendingAction = signal<{ type: string; payload: any } | null>(null);

  copilotMessages = signal<ChatMessage[]>([
    {
      text: '¡Hola! Soy tu Asistente SAMTS. Puedo asistirte en la creación de promociones, generación de artículos de blog optimizados y redacción de mensajes comerciales para WhatsApp. ¿En qué te ayudo hoy?',
      sender: 'ai',
      time: this.getCurrentTime()
    }
  ]);

  get today(): string {
    return new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  ngOnInit() {
    this.loadAiSettings();
  }

  loadAiSettings() {
    this.aiSettingsService.get().subscribe({
      next: (res) => {
        this.aiSettings.set(res);
      },
      error: (err) => {
        console.error('Error fetching settings for assistant', err);
      }
    });
  }
  
  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  toggleCopilot() {
    this.copilotOpen.set(!this.copilotOpen());
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  sendCopilotMessage() {
    if (!this.copilotInput.trim()) return;

    const userText = this.copilotInput;
    this.copilotInput = '';
    
    this.copilotMessages.update(msgs => [...msgs, {
      text: userText,
      sender: 'admin',
      time: this.getCurrentTime()
    }]);

    this.isCopilotTyping.set(true);

    const response = this.getResponseForInput(userText);

    setTimeout(() => {
      this.isCopilotTyping.set(false);
      this.copilotMessages.update(msgs => [...msgs, {
        text: response.text,
        sender: 'ai',
        time: this.getCurrentTime(),
        type: response.type
      }]);

      if (response.type === 'action' && response.actionType) {
        this.pendingAction.set({
          type: response.actionType,
          payload: response.actionPayload
        });
      } else {
        this.pendingAction.set(null);
      }
    }, 1200);
  }

  private getResponseForInput(input: string): { text: string; type?: 'text' | 'action'; actionType?: string; actionPayload?: any } {
    const query = input.toLowerCase();
    const settings = this.aiSettings();
    const tone = settings?.businessTone || 'Profesional';

    if (query.includes('promocion') || query.includes('promoción') || query.includes('descuento') || query.includes('promo')) {
      return {
        text: `He preparado una propuesta de promoción comercial para SAMTS:

📢 **Campaña: Transformación Digital 2026**
🏷️ **Descuento:** 20%
🔑 **Código:** SAMTS20
📝 **Descripción:** 20% de descuento en desarrollo de páginas web, tiendas y catálogos digitales durante este mes.

¿Deseas registrar y activar esta promoción en la base de datos ahora?`,
        type: 'action',
        actionType: 'create-promo',
        actionPayload: {
          title: 'Transformación Digital 2026',
          description: '20% de descuento en desarrollo web, tiendas y catálogos digitales.',
          discountPercent: 20,
          code: 'SAMTS20',
          isActive: true,
          startDate: new Date().toISOString().substring(0, 10),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
        }
      };
    }
    
    if (query.includes('blog') || query.includes('articulo') || query.includes('artículo') || query.includes('idea')) {
      return {
        text: `Aquí tienes 3 ideas de artículos orientados a conversión B2B para SAMTS:

1. 📝 **"Por qué un catálogo digital multiplica las ventas de distribuidores y mayoristas"** (Tono: ${tone})
2. 📝 **"Cómo automatizar la atención a prospectos con agentes IA sin perder el toque humano"**
3. 📝 **"Guía de migración: de ventas por WhatsApp manual a un centro de pedidos digital"**

¿Quieres que genere el borrador completo del primer artículo ahora mismo?`,
        type: 'action',
        actionType: 'create-blog',
        actionPayload: {
          businessType: 'Tecnología y Software',
          businessName: settings?.businessName || 'SAMTS Soluciones',
          city: 'México',
          tone: tone,
          marketingGoal: settings?.businessObjective || 'Generar clientes potenciales'
        }
      };
    }
    
    if (query.includes('whatsapp') || query.includes('closer') || query.includes('mensaje')) {
      return {
        text: `Plantilla comercial recomendada para seguimiento por WhatsApp:

💬 *"Hola [Nombre], te escribe el equipo de SAMTS. Vimos tu interés en modernizar tu sistema comercial. ¿Te parece si agendamos una videollamada demostrativa de 15 minutos esta semana para revisar tu caso?"*

¿Deseas activar el envío automático de mensajes para prospectos calificados?`,
        type: 'action',
        actionType: 'update-whatsapp',
        actionPayload: {
          autoGenerateWhatsappMessages: true,
          isActive: true
        }
      };
    }

    return {
      text: `Como tu Asistente de Operaciones SAMTS, puedo ayudarte con:
- 📢 **Crear Promociones:** Escribe *"crea una promoción"*
- 📝 **Ideas de Blog:** Escribe *"dame ideas de blog"*
- 💬 **Mensajes Comerciales:** Escribe *"redacta un mensaje de ventas"*
¿En qué te gustaría trabajar?`
    };
  }

  executePendingAction() {
    const action = this.pendingAction();
    if (!action) return;

    this.pendingAction.set(null);
    this.isCopilotTyping.set(true);

    if (action.type === 'create-promo') {
      this.promotionsService.create(action.payload).subscribe({
        next: () => {
          this.isCopilotTyping.set(false);
          this.copilotMessages.update(msgs => [...msgs, {
            text: `¡Listo! He registrado la promoción **${action.payload.title}** con el código **${action.payload.code}**. Ya está disponible en la sección de Promociones.`,
            sender: 'ai',
            time: this.getCurrentTime()
          }]);
        },
        error: (err) => {
          this.isCopilotTyping.set(false);
          console.error(err);
          this.copilotMessages.update(msgs => [...msgs, {
            text: `Ocurrió un error al registrar la promoción en la base de datos. Revisa la consola o intenta directamente desde el módulo de Promociones.`,
            sender: 'ai',
            time: this.getCurrentTime()
          }]);
        }
      });
    } else if (action.type === 'create-blog') {
      this.aiGenerationService.generateBlog(action.payload).subscribe({
        next: (generated) => {
          const blogPostPayload = {
            title: generated.title,
            content: generated.content,
            slug: generated.slug,
            excerpt: generated.excerpt || undefined,
            status: 'DRAFT',
            featuredImage: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80'
          };
          this.blogPostsService.create(blogPostPayload).subscribe({
            next: () => {
              this.isCopilotTyping.set(false);
              this.copilotMessages.update(msgs => [...msgs, {
                text: `¡Éxito! Se generó el artículo completo sobre **"${generated.title}"** y se guardó en borrador. Puedes revisarlo y publicarlo desde la sección de Contenido.`,
                sender: 'ai',
                time: this.getCurrentTime()
              }]);
            },
            error: (err) => {
              this.isCopilotTyping.set(false);
              console.error(err);
              this.copilotMessages.update(msgs => [...msgs, {
                text: `El contenido fue generado pero no se pudo guardar en borrador.`,
                sender: 'ai',
                time: this.getCurrentTime()
              }]);
            }
          });
        },
        error: (err) => {
          this.isCopilotTyping.set(false);
          console.error(err);
          this.copilotMessages.update(msgs => [...msgs, {
            text: `No se pudo conectar con el servicio de generación de contenido en este momento.`,
            sender: 'ai',
            time: this.getCurrentTime()
          }]);
        }
      });
    } else if (action.type === 'update-whatsapp') {
      const currentSettings = this.aiSettings() || {};
      const updated = { ...currentSettings, ...action.payload };
      const payload = {
        businessTone: updated.businessTone,
        targetAudience: updated.targetAudience,
        businessObjective: updated.businessObjective,
        keywords: updated.keywords,
        postingFrequency: updated.postingFrequency,
        autoGenerateBlogs: updated.autoGenerateBlogs,
        autoGeneratePromotions: updated.autoGeneratePromotions,
        autoGenerateSeo: updated.autoGenerateSeo,
        autoGenerateWhatsappMessages: updated.autoGenerateWhatsappMessages,
        isActive: updated.isActive,
      };
      this.aiSettingsService.update(payload).subscribe({
        next: () => {
          this.isCopilotTyping.set(false);
          this.aiSettings.set(updated);
          this.copilotMessages.update(msgs => [...msgs, {
            text: `¡Configuración actualizada! Se activó la automatización de mensajes comerciales.`,
            sender: 'ai',
            time: this.getCurrentTime()
          }]);
        },
        error: (err) => {
          this.isCopilotTyping.set(false);
          console.error(err);
          this.copilotMessages.update(msgs => [...msgs, {
            text: `Ocurrió un error al actualizar la configuración de agentes.`,
            sender: 'ai',
            time: this.getCurrentTime()
          }]);
        }
      });
    }
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  }

  ngAfterViewChecked() {
    try {
      if (this.copilotScrollContainer && this.copilotOpen()) {
        this.copilotScrollContainer.nativeElement.scrollTop = this.copilotScrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}
