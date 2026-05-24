import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 flex items-center justify-center min-h-[70vh]">
      <div class="text-center space-y-4">
        <div class="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="pi pi-chart-bar text-3xl text-blue-400"></i>
        </div>
        <h2 class="text-2xl font-display font-bold text-slate-900 dark:text-white">Analíticas Avanzadas</h2>
        <p class="text-slate-600 dark:text-slate-400 max-w-md mx-auto">El módulo de reportes está recopilando datos de entrenamiento. Estará disponible en la próxima actualización del dashboard.</p>
        <button class="mt-4 bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-white px-6 py-2.5 rounded-lg font-medium transition-all">
          Generar Reporte PDF Manual
        </button>
      </div>
    </div>
  `
})
export class AnalyticsComponent {}
