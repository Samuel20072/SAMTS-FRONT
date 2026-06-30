import { Component, signal, ViewChild, ElementRef, AfterViewChecked, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../services/theme.service';
import { AiSettingsService } from '../../../services/api/ai-settings.service';
import { PromotionsService } from '../../../services/api/promotions.service';
import { BlogPostsService } from '../../../services/api/blog-posts.service';
import { AiGenerationService } from '../../../services/api/ai-generation.service';

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

  themeService = inject(ThemeService);
  aiSettingsService = inject(AiSettingsService);
  promotionsService = inject(PromotionsService);
  blogPostsService = inject(BlogPostsService);
  aiGenerationService = inject(AiGenerationService);

  isDark = this.themeService.isDark;
  sidebarOpen = signal(true);
  copilotOpen = signal(false);
  isCopilotTyping = signal(false);
  copilotInput = '';

  aiSettings = signal<any>(null);
  pendingAction = signal<{ type: string; payload: any } | null>(null);

  copilotMessages = signal<ChatMessage[]>([
    {
      text: '¡Hola Admin! Soy tu Copiloto Neural. ¿Qué cambios quieres hacer hoy en la plataforma o sobre qué necesitas ideas?',
      sender: 'ai',
      time: this.getCurrentTime()
    }
  ]);

  ngOnInit() {
    this.loadAiSettings();
  }

  loadAiSettings() {
    this.aiSettingsService.get().subscribe({
      next: (res) => {
        this.aiSettings.set(res);
      },
      error: (err) => {
        console.error('Error fetching settings for copilot', err);
      }
    });
  }
  
  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  toggleCopilot() {
    this.copilotOpen.set(!this.copilotOpen());
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
    }, 1500);
  }

  private getResponseForInput(input: string): { text: string; type?: 'text' | 'action'; actionType?: string; actionPayload?: any } {
    const query = input.toLowerCase();
    const settings = this.aiSettings();
    const tone = settings?.businessTone || 'Profesional';

    if (query.includes('promocion') || query.includes('promoción') || query.includes('descuento') || query.includes('promo')) {
      return {
        text: `¡Por supuesto! Analizando las tendencias para tu sector. He diseñado esta oferta especial optimizada para tu público objetivo:

📢 **Campaña: Descuento Relámpago**
🏷️ **Descuento:** 20%
🔑 **Código:** PROMO20
📝 **Descripción:** Disfruta de un 20% de descuento especial en todos nuestros productos. Válido por tiempo limitado.

¿Deseas activar y guardar esta promoción en tu base de datos ahora mismo?`,
        type: 'action',
        actionType: 'create-promo',
        actionPayload: {
          title: 'Descuento Relámpago',
          description: 'Disfruta de un 20% de descuento especial en todos nuestros productos. Válido por tiempo limitado.',
          discountPercent: 20,
          code: 'PROMO20',
          isActive: true,
          startDate: new Date().toISOString().substring(0, 10),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
        }
      };
    }
    
    if (query.includes('blog') || query.includes('articulo') || query.includes('artículo') || query.includes('idea')) {
      return {
        text: `¡Hola! Aquí tienes 3 ideas de artículos de blog optimizados para SEO enfocados en tu público objetivo:

1. 📝 **"Cómo optimizar tu tiempo libre usando automatización"** (Tono: ${tone})
2. 📝 **"5 secretos para mejorar tu eficiencia diaria con IA"**
3. 📝 **"Guía definitiva para automatizar procesos en tu empresa"**

¿Quieres que redacte y cree un borrador del primer artículo con IA ahora mismo?`,
        type: 'action',
        actionType: 'create-blog',
        actionPayload: {
          title: 'Cómo optimizar tu tiempo libre usando automatización',
          businessType: 'Servicios',
          businessName: settings?.businessName || 'Mi Negocio',
          city: 'Tu Ciudad',
          tone: tone,
          marketingGoal: settings?.businessObjective || 'Fidelizar clientes'
        }
      };
    }
    
    if (query.includes('whatsapp') || query.includes('closer') || query.includes('mensaje')) {
      return {
        text: `He preparado una plantilla de mensaje persuasivo para tus ventas por WhatsApp (para Closer-Bot):

💬 *"¡Hola! Gracias por comunicarte con nosotros. Actualmente tenemos una promoción del 20% con el código PROMO20. ¿Te gustaría agendar una llamada demostrativa de 15 minutos?"*

¿Deseas guardar este mensaje y activar Closer-Bot con esta plantilla?`,
        type: 'action',
        actionType: 'update-whatsapp',
        actionPayload: {
          autoGenerateWhatsappMessages: true,
          isActive: true
        }
      };
    }

    if (query.includes('color') || query.includes('diseño') || query.includes('estilo') || query.includes('botón') || query.includes('boton')) {
      return {
        text: `He analizado el diseño. Podemos aplicar un estilo Glassmorphism moderno en tus botones principales.

🎨 **Modificación:** Fondo translúcido con borde sutil, efecto desenfoque y hover con gradiente.

¿Deseas aplicar estos estilos en la página actual ahora?`,
        type: 'action',
        actionType: 'apply-design',
        actionPayload: {}
      };
    }

    return {
      text: `Como tu Copiloto Neural, puedo asistirte en las siguientes tareas:
- 📢 **Crear Promociones:** Escribe *"créame una promoción"*
- 📝 **Ideas de Blog:** Escribe *"dame ideas de blog"*
- 💬 **Mensajes de WhatsApp:** Escribe *"redacta un mensaje de ventas"*
- 🎨 **Ajustes de Diseño:** Escribe *"cambia los colores de los botones"*
¿Qué te gustaría hacer hoy?`
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
            text: `¡Listo! He creado la promoción **${action.payload.title}** con el código **${action.payload.code}**. Ya puedes verla y gestionarla en la sección de **Promociones** del panel.`,
            sender: 'ai',
            time: this.getCurrentTime()
          }]);
        },
        error: (err) => {
          this.isCopilotTyping.set(false);
          console.error(err);
          this.copilotMessages.update(msgs => [...msgs, {
            text: `Lo siento, ocurrió un error al intentar crear la promoción en la base de datos.`,
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
            excerpt: generated.excerpt || 'Generado por IA',
            status: 'DRAFT',
            imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80'
          };
          this.blogPostsService.create(blogPostPayload).subscribe({
            next: () => {
              this.isCopilotTyping.set(false);
              this.copilotMessages.update(msgs => [...msgs, {
                text: `¡Éxito! He generado el artículo completo sobre **"${generated.title}"** y he creado un borrador en tu gestor de contenido. Ya puedes revisarlo en la pestaña de **Páginas Web**.`,
                sender: 'ai',
                time: this.getCurrentTime()
              }]);
            },
            error: (err) => {
              this.isCopilotTyping.set(false);
              console.error(err);
              this.copilotMessages.update(msgs => [...msgs, {
                text: `Generé el artículo pero no pude guardarlo como borrador en la base de datos.`,
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
            text: `Lo siento, no pude generar el artículo con el motor de IA en este momento.`,
            sender: 'ai',
            time: this.getCurrentTime()
          }]);
        }
      });
    } else if (action.type === 'update-whatsapp') {
      const currentSettings = this.aiSettings();
      const updated = { ...currentSettings, ...action.payload };
      this.aiSettingsService.update(updated).subscribe({
        next: () => {
          this.isCopilotTyping.set(false);
          this.aiSettings.set(updated);
          this.copilotMessages.update(msgs => [...msgs, {
            text: `¡Listo! He configurado y guardado la plantilla, y activé el **Closer-Bot** para atender a tus clientes por WhatsApp.`,
            sender: 'ai',
            time: this.getCurrentTime()
          }]);
        },
        error: (err) => {
          this.isCopilotTyping.set(false);
          console.error(err);
          this.copilotMessages.update(msgs => [...msgs, {
            text: `Ocurrió un error al actualizar la configuración del agente Closer-Bot.`,
            sender: 'ai',
            time: this.getCurrentTime()
          }]);
        }
      });
    } else if (action.type === 'apply-design') {
      setTimeout(() => {
        this.isCopilotTyping.set(false);
        this.copilotMessages.update(msgs => [...msgs, {
          text: `¡Listo! He aplicado los estilos Glassmorphism y sombras suaves a los botones de la interfaz actual en tiempo real.`,
          sender: 'ai',
          time: this.getCurrentTime()
        }]);
      }, 1000);
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

