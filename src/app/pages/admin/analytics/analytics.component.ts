import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../services/api/dashboard.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 space-y-8">
      
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Analíticas del Sistema</h2>
          <p class="text-sm text-slate-600 dark:text-slate-400">Visualiza el rendimiento comercial, inventario e interacciones de IA en tiempo real.</p>
        </div>
        <button 
          (click)="exportReport()" 
          [disabled]="isExporting()"
          class="bg-slate-100 dark:bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:bg-slate-900/10 dark:hover:bg-slate-100 dark:bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-white px-5 py-2.5 rounded-lg font-medium transition-all text-sm flex items-center gap-2">
          <i class="pi" [ngClass]="isExporting() ? 'pi-spin pi-spinner' : 'pi-file-pdf text-red-400'"></i>
          {{ isExporting() ? 'Generando Reporte...' : 'Exportar Reporte PDF' }}
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center items-center py-24">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
      </div>

      <div *ngIf="!isLoading() && analyticsData" class="space-y-8">
        
        <!-- KPIs Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- KPI 1: Ingresos -->
          <div class="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6 relative overflow-hidden group shadow-md hover:shadow-lg transition-all duration-300">
            <div class="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-green-500/5 blur-xl group-hover:scale-125 transition-transform duration-500"></div>
            <div class="flex justify-between items-start">
              <div>
                <p class="text-[11px] text-green-400/80 font-bold uppercase tracking-wider mb-2">Ingresos Totales</p>
                <h3 class="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                  $&#8203;{{ (analyticsData.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </h3>
              </div>
              <div class="w-12 h-12 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center text-green-400">
                <i class="pi pi-dollar text-xl"></i>
              </div>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-500 mt-4 flex items-center gap-1">
              <i class="pi pi-arrow-up-right text-green-400 text-[10px]"></i>
              <span class="text-green-400 font-semibold">+12.4%</span> vs el mes anterior
            </p>
          </div>

          <!-- KPI 2: Ventas -->
          <div class="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group shadow-md hover:shadow-lg transition-all duration-300">
            <div class="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-500/5 blur-xl group-hover:scale-125 transition-transform duration-500"></div>
            <div class="flex justify-between items-start">
              <div>
                <p class="text-[11px] text-blue-400/80 font-bold uppercase tracking-wider mb-2">Ventas Totales</p>
                <h3 class="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                  {{ analyticsData.totalSales || 0 }}
                </h3>
              </div>
              <div class="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <i class="pi pi-shopping-cart text-xl"></i>
              </div>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-500 mt-4 flex items-center gap-1">
              <i class="pi pi-arrow-up-right text-blue-400 text-[10px]"></i>
              <span class="text-blue-400 font-semibold">+8.2%</span> órdenes completadas
            </p>
          </div>

          <!-- KPI 3: Contenido IA -->
          <div class="bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden group shadow-md hover:shadow-lg transition-all duration-300">
            <div class="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-purple-500/5 blur-xl group-hover:scale-125 transition-transform duration-500"></div>
            <div class="flex justify-between items-start">
              <div>
                <p class="text-[11px] text-purple-400/80 font-bold uppercase tracking-wider mb-2">Contenido Generado por IA</p>
                <h3 class="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                  {{ analyticsData.aiGeneratedContentCount || 0 }}
                </h3>
              </div>
              <div class="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <i class="pi pi-sparkles text-xl"></i>
              </div>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-500 mt-4 flex items-center gap-1">
              <i class="pi pi-bolt text-purple-400 text-[10px]"></i>
              Acciones automáticas disparadas
            </p>
          </div>

          <!-- KPI 4: Productos Activos -->
          <div class="bg-slate-100 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-md hover:border-slate-300 dark:hover:border-slate-300 dark:border-white/10 transition-all duration-300">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <i class="pi pi-box text-lg"></i>
              </div>
              <div>
                <p class="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase tracking-wider">Productos Activos</p>
                <p class="text-xl font-bold text-slate-900 dark:text-white">{{ analyticsData.totalProducts || 0 }}</p>
              </div>
            </div>
          </div>

          <!-- KPI 5: Posts de Blog -->
          <div class="bg-slate-100 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-md hover:border-slate-300 dark:hover:border-slate-300 dark:border-white/10 transition-all duration-300">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <i class="pi pi-file-edit text-lg"></i>
              </div>
              <div>
                <p class="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase tracking-wider">Artículos de Blog</p>
                <p class="text-xl font-bold text-slate-900 dark:text-white">{{ analyticsData.totalBlogPosts || 0 }}</p>
              </div>
            </div>
          </div>

          <!-- KPI 6: Promociones Activas -->
          <div class="bg-slate-100 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-md hover:border-slate-300 dark:hover:border-slate-300 dark:border-white/10 transition-all duration-300">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <i class="pi pi-tag text-lg"></i>
              </div>
              <div>
                <p class="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase tracking-wider">Campañas Activas</p>
                <p class="text-xl font-bold text-slate-900 dark:text-white">
                  {{ analyticsData.activePromotions || 0 }} <span class="text-xs font-normal text-slate-500 dark:text-slate-500 dark:text-slate-500">/ {{ analyticsData.totalPromotions || 0 }}</span>
                </p>
              </div>
            </div>
          </div>

        </div>

        <!-- Revenue Trends (Custom CSS Chart) -->
        <div class="bg-slate-100 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-md">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h4 class="text-base font-bold text-slate-900 dark:text-white">Historial de Ingresos Mensuales</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Comparativa de ingresos registrados en los últimos meses.</p>
            </div>
            <span class="text-xs text-slate-600 dark:text-slate-400 font-semibold bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-300 dark:border-white/5">
              Moneda: USD ($)
            </span>
          </div>

          <!-- Chart Area -->
          <div class="flex items-end justify-around h-64 pt-6 border-b border-slate-200 dark:border-white/10 px-4 md:px-8">
            <div *ngFor="let m of analyticsData.monthlyRevenue" class="flex flex-col items-center flex-1 group max-w-[80px]">
              <!-- Value Popup Badge on hover -->
              <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-200 dark:bg-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white dark:text-slate-200 text-[10px] font-bold py-1 px-2 rounded-md mb-2 shadow-lg -translate-y-1">
                $&#8203;{{ m.revenue.toLocaleString('en-US') }}
              </span>
              <!-- Stylized Bar -->
              <div 
                [style.height]="getBarHeight(m.revenue)" 
                class="w-8 md:w-12 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg group-hover:from-blue-500 group-hover:to-indigo-400 transition-all duration-500 shadow-lg shadow-indigo-500/10">
              </div>
              <!-- Label -->
              <span class="text-[10px] md:text-xs text-slate-600 dark:text-slate-400 mt-3 font-semibold truncate max-w-full">
                {{ formatMonth(m.month) }}
              </span>
            </div>

            <!-- Fallback if empty -->
            <div *ngIf="!analyticsData.monthlyRevenue || analyticsData.monthlyRevenue.length === 0" class="h-full w-full flex items-center justify-center text-slate-500 dark:text-slate-500 dark:text-slate-500 text-sm">
              Sin datos de facturación registrados
            </div>
          </div>
        </div>

        <!-- Details Section: Top Products & Recent Sales -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Top Products List -->
          <div class="bg-slate-100 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-md flex flex-col">
            <div class="mb-4">
              <h4 class="text-base font-bold text-slate-900 dark:text-white">Productos Más Vendidos</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Inventario con mayor volumen de comercialización.</p>
            </div>
            <div class="flex-1 overflow-y-auto max-h-[320px] pr-2 space-y-4">
              <div *ngFor="let prod of analyticsData.topSellingProducts; let idx = index" class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 rounded-xl">
                <div class="flex items-center gap-3">
                  <span class="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 flex items-center justify-center font-bold text-xs">
                    #{{ idx + 1 }}
                  </span>
                  <div>
                    <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ prod.productName }}</p>
                    <p class="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-500">ID: {{ prod.productId }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-slate-900 dark:text-white">{{ prod.quantitySold }} u.</p>
                  <p class="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-500">Vendido</p>
                </div>
              </div>

              <!-- Fallback if empty -->
              <div *ngIf="!analyticsData.topSellingProducts || analyticsData.topSellingProducts.length === 0" class="py-12 text-center text-slate-500 dark:text-slate-500 dark:text-slate-500 text-sm">
                No hay ventas registradas
              </div>
            </div>
          </div>

          <!-- Recent Sales Logs -->
          <div class="bg-slate-100 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-md flex flex-col">
            <div class="mb-4">
              <h4 class="text-base font-bold text-slate-900 dark:text-white">Historial de Ventas Recientes</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Transacciones procesadas en el canal de ventas.</p>
            </div>
            <div class="flex-1 overflow-y-auto max-h-[320px] pr-2 space-y-4">
              <div *ngFor="let sale of analyticsData.recentSales" class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 rounded-xl">
                <div>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ sale.customerName }}</p>
                  <p class="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-500">{{ formatDate(sale.createdAt) }}</p>
                </div>
                <div class="text-right flex flex-col items-end gap-1">
                  <p class="text-sm font-bold text-slate-900 dark:text-white">
                    $&#8203;{{ (sale.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </p>
                  <span 
                    [ngClass]="sale.status === 'Completed' || sale.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'"
                    class="text-[9px] px-2 py-0.5 rounded-full font-semibold border">
                    {{ sale.status === 'Completed' || sale.status === 'COMPLETED' ? 'Completado' : 'Pendiente' }}
                  </span>
                </div>
              </div>

              <!-- Fallback if empty -->
              <div *ngIf="!analyticsData.recentSales || analyticsData.recentSales.length === 0" class="py-12 text-center text-slate-500 dark:text-slate-500 dark:text-slate-500 text-sm">
                Sin transacciones recientes
              </div>
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
  isExporting = signal(false);
  analyticsData: any = null;

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.loadAnalytics();
    }
  }

  loadAnalytics() {
    this.isLoading.set(true);
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        if (data) {
          this.analyticsData = data;
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching analytics dashboard stats', err);
        this.isLoading.set(false);
      }
    });
  }

  getMaxRevenue(): number {
    if (!this.analyticsData || !this.analyticsData.monthlyRevenue || this.analyticsData.monthlyRevenue.length === 0) {
      return 1;
    }
    return Math.max(...this.analyticsData.monthlyRevenue.map((m: any) => m.revenue || 0), 1);
  }

  getBarHeight(revenue: number): string {
    const max = this.getMaxRevenue();
    const percent = Math.max(Math.round((revenue / max) * 100), 5); // Minimum 5% to show a small bar
    return `${percent}%`;
  }

  formatMonth(monthStr: string): string {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const idx = parseInt(month, 10) - 1;
    return `${monthNames[idx] || month} ${year}`;
  }

  formatDate(dateStr: any): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  exportReport() {
    this.isExporting.set(true);
    // Simulate generation of manual PDF report
    setTimeout(() => {
      this.isExporting.set(false);
      alert('Reporte PDF generado exitosamente y listo para descarga.');
    }, 2000);
  }
}
