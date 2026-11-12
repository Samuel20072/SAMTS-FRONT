import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../../services/api/dashboard.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Analíticas Comerciales</h1>
          <p class="text-xs text-slate-500 mt-0.5">Indicadores clave de captación de leads, pipeline y rendimiento de ventas SAMTS.</p>
        </div>
        <button 
          (click)="loadAnalytics()" 
          class="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors shadow-sm">
          <i class="pi pi-refresh text-xs text-slate-500"></i>
          Actualizar Métricas
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="py-20 text-center">
        <i class="pi pi-spinner animate-spin text-3xl text-blue-600"></i>
        <p class="text-xs text-slate-400 mt-2">Calculando analíticas...</p>
      </div>

      <!-- Main Analytics View -->
      <div *ngIf="!isLoading() && stats" class="space-y-6">
        
        <!-- Primary KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <!-- Conversion Rate -->
          <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">Tasa de Conversión</span>
            <div class="text-2xl font-bold text-slate-900">{{ stats.conversionRate | number:'1.1-1' }}%</div>
            <p class="text-[11px] text-slate-400 mt-1">{{ stats.wonLeads }} de {{ stats.totalLeads }} convertidos</p>
          </div>

          <!-- Total Pipeline -->
          <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">Valor en Pipeline</span>
            <div class="text-2xl font-bold text-slate-900">\${{ stats.estimatedPipelineValue | number:'1.0-0' }}</div>
            <p class="text-[11px] text-slate-400 mt-1">{{ stats.openOpportunities }} acuerdos activos</p>
          </div>

          <!-- Won Revenue (valor estimado, no dinero cobrado) -->
          <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">Valor Ganado (Estimado)</span>
            <div class="text-2xl font-bold text-emerald-700">\${{ stats.wonRevenue | number:'1.0-0' }}</div>
            <p class="text-[11px] text-slate-400 mt-1">Valor estimado de cierres ganados (no facturado)</p>
          </div>

          <!-- Pending Follow-ups -->
          <div class="bg-white border rounded-xl p-4 shadow-sm"
               [ngClass]="stats.pendingFollowUps > 0 ? 'border-orange-300 bg-orange-50/30' : 'border-slate-200'">
            <span class="text-[10px] font-bold uppercase tracking-wider block mb-1"
                  [ngClass]="stats.pendingFollowUps > 0 ? 'text-orange-700' : 'text-slate-400'">
              Seguimientos por Atender
            </span>
            <div class="text-2xl font-bold" [ngClass]="stats.pendingFollowUps > 0 ? 'text-orange-800' : 'text-slate-900'">
              {{ stats.pendingFollowUps }}
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Requieren llamada o mensaje</p>
          </div>

        </div>

        <!-- Breakdown Section: Status Distribution & Resource Inventory -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Status Distribution -->
          <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 class="text-sm font-bold text-slate-900 mb-1">Distribución de Leads por Estado</h3>
              <p class="text-xs text-slate-500 mb-5">Estado actual de todos los contactos en la base de datos comercial.</p>

              <div class="space-y-3">
                <div *ngFor="let item of statusDistribution" class="space-y-1">
                  <div class="flex justify-between text-xs">
                    <span class="font-medium text-slate-700">{{ item.label }}</span>
                    <span class="text-slate-500 font-mono">{{ item.count }} ({{ item.percent }}%)</span>
                  </div>
                  <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500"
                         [ngClass]="item.color"
                         [style.width.%]="item.percent > 0 ? item.percent : 2"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
              <span>Total analizado: {{ stats.totalLeads }} contactos</span>
              <span>Actualizado en tiempo real</span>
            </div>
          </div>

          <!-- Operational Inventory & Campaign Metrics -->
          <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 class="text-sm font-bold text-slate-900 mb-1">Capacidad Operativa y Contenido</h3>
              <p class="text-xs text-slate-500 mb-5">Inventario de activos digitales disponibles para comercialización.</p>

              <div class="grid grid-cols-2 gap-3 mb-6">
                <div class="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                    <i class="pi pi-box text-xs"></i>
                  </div>
                  <span class="text-xl font-bold text-slate-900 block">{{ stats.totalProducts }}</span>
                  <span class="text-[11px] text-slate-500">Servicios en Catálogo</span>
                </div>

                <div class="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                    <i class="pi pi-tag text-xs"></i>
                  </div>
                  <span class="text-xl font-bold text-slate-900 block">{{ stats.activePromotions }}</span>
                  <span class="text-[11px] text-slate-500">Promociones Activas</span>
                </div>

                <div class="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                    <i class="pi pi-file-edit text-xs"></i>
                  </div>
                  <span class="text-xl font-bold text-slate-900 block">{{ stats.totalBlogPosts }}</span>
                  <span class="text-[11px] text-slate-500">Artículos Publicados</span>
                </div>

                <div class="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                    <i class="pi pi-users text-xs"></i>
                  </div>
                  <span class="text-xl font-bold text-slate-900 block">{{ stats.wonLeads }}</span>
                  <span class="text-[11px] text-slate-500">Clientes Atendidos</span>
                </div>
              </div>
            </div>

            <div class="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 flex items-start gap-2">
              <i class="pi pi-info-circle text-blue-500 mt-0.5"></i>
              <span>Las analíticas reflejan datos reales consultados directamente de PostgreSQL en tiempo de ejecución.</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  isLoading = signal(true);
  stats: DashboardStats | null = null;

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.loadAnalytics();
    }
  }

  loadAnalytics() {
    this.isLoading.set(true);
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching analytics dashboard stats', err);
        this.isLoading.set(false);
      }
    });
  }

  get statusDistribution() {
    if (!this.stats) return [];
    const total = this.stats.totalLeads || 1;
    const leadsByStatus = this.stats.leadsByStatus || {};

    const configs = [
      { key: 'NEW', label: 'Nuevos', color: 'bg-slate-400' },
      { key: 'CONTACTED', label: 'Contactados', color: 'bg-sky-400' },
      { key: 'QUALIFIED', label: 'Calificados', color: 'bg-blue-500' },
      { key: 'PROPOSAL_SENT', label: 'Propuesta Enviada', color: 'bg-purple-500' },
      { key: 'NEGOTIATION', label: 'Negociación', color: 'bg-amber-500' },
      { key: 'WON', label: 'Ganados', color: 'bg-emerald-500' },
      { key: 'LOST', label: 'Perdidos', color: 'bg-rose-400' },
      { key: 'FOLLOW_UP', label: 'Seguimiento', color: 'bg-orange-400' }
    ];

    return configs.map(c => {
      const count = leadsByStatus[c.key] || 0;
      return {
        label: c.label,
        count,
        percent: Math.round((count / total) * 100),
        color: c.color
      };
    });
  }
}
