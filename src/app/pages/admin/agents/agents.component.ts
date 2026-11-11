import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiSettingsService } from '../../../services/api/ai-settings.service';

interface AgentInfo {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'Activo' | 'Inactivo';
  engine: string;
  settingField: string;
  capabilities: string[];
}

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Agentes de Inteligencia Artificial</h1>
          <p class="text-xs text-slate-500 mt-0.5">Control y automatización de los agentes comerciales y generadores de contenido de SAMTS.</p>
        </div>
        <div class="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 font-medium">
          <i class="pi pi-check-circle mr-1 text-emerald-600"></i>
          3 Agentes configurados en plataforma
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="py-20 text-center">
        <i class="pi pi-spinner animate-spin text-3xl text-blue-600"></i>
        <p class="text-xs text-slate-400 mt-2">Sincronizando agentes...</p>
      </div>

      <!-- Main Agents Grid -->
      <div *ngIf="!isLoading()" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div *ngFor="let agent of agents" 
             class="bg-white border rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between"
             [ngClass]="agent.status === 'Activo' ? 'border-slate-200' : 'border-slate-200 opacity-80'">
          
          <div>
            <!-- Top Card Header -->
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                     [ngClass]="agent.status === 'Activo' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-400'">
                  <i class="pi pi-microchip"></i>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">{{ agent.name }}</h3>
                  <p class="text-[11px] text-slate-500">{{ agent.role }}</p>
                </div>
              </div>

              <!-- Status Switch -->
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-semibold uppercase tracking-wider"
                      [ngClass]="agent.status === 'Activo' ? 'text-emerald-700' : 'text-slate-400'">
                  {{ agent.status }}
                </span>
                <button 
                  (click)="toggleAgent(agent)"
                  [disabled]="isUpdating()"
                  [ngClass]="agent.status === 'Activo' ? 'bg-emerald-600' : 'bg-slate-300'"
                  class="w-9 h-5 rounded-full p-0.5 transition-colors relative focus:outline-none disabled:opacity-50"
                  [title]="agent.status === 'Activo' ? 'Desactivar agente' : 'Activar agente'">
                  <div 
                    [ngClass]="agent.status === 'Activo' ? 'translate-x-4' : 'translate-x-0'"
                    class="w-4 h-4 bg-white rounded-full shadow transition-transform"></div>
                </button>
              </div>
            </div>

            <!-- Description -->
            <p class="text-xs text-slate-600 mb-4 min-h-[36px]">{{ agent.description }}</p>

            <!-- Capabilities List -->
            <div class="space-y-1.5 pt-3 border-t border-slate-100 mb-4">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Capacidades</span>
              <div *ngFor="let cap of agent.capabilities" class="flex items-center gap-1.5 text-xs text-slate-700">
                <i class="pi pi-check text-emerald-600 text-[10px]"></i>
                <span>{{ cap }}</span>
              </div>
            </div>
          </div>

          <!-- Bottom Engine Info -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-[11px] text-slate-400">Motor de IA:</span>
            <span class="font-mono text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {{ agent.engine }}
            </span>
          </div>

        </div>
      </div>

      <!-- Tone & Business Context summary -->
      <div *ngIf="settings" class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
        <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Contexto de Inteligencia Artificial de SAMTS</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
          <div>
            <span class="text-slate-400 text-[11px] block">Tono de Comunicación:</span>
            <span class="font-medium text-slate-800">{{ settings.businessTone || 'Profesional y Consultivo' }}</span>
          </div>
          <div>
            <span class="text-slate-400 text-[11px] block">Objetivo Comercial:</span>
            <span class="font-medium text-slate-800">{{ settings.businessObjective || 'Captar clientes B2B para desarrollo tecnológico' }}</span>
          </div>
          <div>
            <span class="text-slate-400 text-[11px] block">Nombre Comercial Asociado:</span>
            <span class="font-medium text-slate-800">{{ settings.businessName || 'SAMTS Soluciones Tecnológicas' }}</span>
          </div>
        </div>
      </div>

    </div>
  `
})
export class AgentsComponent implements OnInit {
  private aiSettingsService = inject(AiSettingsService);

  isLoading = signal(true);
  isUpdating = signal(false);
  settings: any = null;

  agents: AgentInfo[] = [
    {
      id: 'nexus',
      name: 'Samuel AI / Asistente Web',
      role: 'Atención Comercial y Diagnóstico',
      description: 'Interactúa con prospectos en la web, realiza el diagnóstico comercial inicial y registra el lead en el CRM.',
      status: 'Inactivo',
      engine: 'Gemini 2.5 Pro / Flash',
      settingField: 'isActive',
      capabilities: [
        'Diagnóstico comercial automatizado',
        'Captura de necesidades y presupuesto',
        'Registro directo en CRM con calificación'
      ]
    },
    {
      id: 'closer',
      name: 'Closer-Bot WhatsApp',
      role: 'Seguimiento y Redacción Comercial',
      description: 'Genera propuestas personalizadas y mensajes de seguimiento directo para prospectos por WhatsApp.',
      status: 'Inactivo',
      engine: 'Gemini 2.5 Flash',
      settingField: 'autoGenerateWhatsappMessages',
      capabilities: [
        'Propuestas redactadas con tono de marca',
        'Respuestas a objeciones frecuentes',
        'Enlaces directos a demos y promociones'
      ]
    },
    {
      id: 'seo',
      name: 'Blog & Content Studio',
      role: 'Generador de Artículos SEO',
      description: 'Crea artículos de blog estructurados, optimizados para posicionamiento orgánico en Google.',
      status: 'Inactivo',
      engine: 'Claude 3.5 / Gemini 2.5',
      settingField: 'autoGenerateBlogs',
      capabilities: [
        'Estructura H2/H3 orientada a conversión',
        'Generación de extractos y slugs automáticos',
        'Publicación en borrador para revisión humana'
      ]
    },
  ];

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.loadSettings();
    }
  }

  loadSettings() {
    this.isLoading.set(true);
    this.aiSettingsService.get().subscribe({
      next: (res) => {
        if (res) {
          this.settings = res;
          this.updateAgentsStatus();
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching settings', err);
        this.isLoading.set(false);
      }
    });
  }

  updateAgentsStatus() {
    this.agents = this.agents.map(agent => ({
      ...agent,
      status: this.settings[agent.settingField] ? 'Activo' : 'Inactivo'
    }));
  }

  toggleAgent(agent: AgentInfo) {
    if (!this.settings || this.isUpdating()) return;

    this.isUpdating.set(true);
    const updatedValue = !this.settings[agent.settingField];
    const updatePayload = {
      [agent.settingField]: updatedValue
    };

    this.aiSettingsService.update(updatePayload).subscribe({
      next: (res) => {
        if (res) {
          this.settings = { ...this.settings, ...res };
          this.updateAgentsStatus();
        }
        this.isUpdating.set(false);
      },
      error: (err) => {
        console.error('Error updating agent status', err);
        this.isUpdating.set(false);
      }
    });
  }
}
