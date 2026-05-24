import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Agentes de IA</h2>
          <p class="text-sm text-slate-600 dark:text-slate-400">Controla las redes neuronales y agentes que operan en tu ecosistema.</p>
        </div>
        <button class="bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <i class="pi pi-plus"></i>
          Entrenar Nuevo Agente
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div *ngFor="let agent of agents" class="bg-slate-100 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <!-- Background Glow based on status -->
          <div class="absolute -right-20 -top-20 w-40 h-40 rounded-full blur-[60px] opacity-20"
               [ngClass]="agent.status === 'Activo' ? 'bg-green-500' : 'bg-yellow-500'"></div>
               
          <div class="flex justify-between items-start mb-6 relative z-10">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <i class="pi pi-microchip text-2xl text-indigo-400"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ agent.name }}</h3>
                <p class="text-xs text-slate-600 dark:text-slate-400">{{ agent.role }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    [ngClass]="agent.status === 'Activo' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'">
                <span class="w-1.5 h-1.5 rounded-full" [ngClass]="agent.status === 'Activo' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'"></span> 
                {{ agent.status }}
              </span>
              <button class="w-8 h-8 rounded hover:bg-slate-900/10 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
                <i class="pi pi-cog"></i>
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-white/5 pt-4 relative z-10">
            <div>
              <p class="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">Interacciones</p>
              <p class="text-lg font-semibold text-slate-900 dark:text-white">{{ agent.interactions }}</p>
            </div>
            <div>
              <p class="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">Tasa de Éxito</p>
              <p class="text-lg font-semibold text-slate-900 dark:text-white">{{ agent.successRate }}</p>
            </div>
            <div>
              <p class="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">Modelo</p>
              <p class="text-sm font-semibold text-blue-400 mt-1">{{ agent.model }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AgentsComponent {
  agents = [
    { name: 'Nexus-V1', role: 'Atención al Cliente (Web)', status: 'Activo', interactions: '1,245', successRate: '94.2%', model: 'GPT-4 Turbo' },
    { name: 'Closer-Bot', role: 'Ventas por WhatsApp', status: 'Activo', interactions: '856', successRate: '42.8%', model: 'Llama 3 (Fine-tuned)' },
    { name: 'SEO-Generator', role: 'Creación de Contenido', status: 'En Espera', interactions: '320', successRate: '98.1%', model: 'Claude 3.5' },
  ];
}
