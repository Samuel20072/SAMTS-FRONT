import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesService } from '../../../services/api/sales.service';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-display font-bold text-slate-900 dark:text-white">Gestión de Ventas</h2>
        <button class="bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <i class="pi pi-plus"></i>
          Nueva Venta
        </button>
      </div>
      
      <div class="bg-slate-100 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-200 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-white/5">
              <th class="p-4 font-medium">Cliente</th>
              <th class="p-4 font-medium">Contacto</th>
              <th class="p-4 font-medium">Monto</th>
              <th class="p-4 font-medium">Estado</th>
              <th class="p-4 font-medium">Fecha</th>
              <th class="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-slate-700 dark:text-slate-300 relative">
            <tr *ngIf="isLoading()" class="absolute inset-0 flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 min-h-[100px]">
               <td colspan="6" class="text-center"><i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i></td>
            </tr>
            <tr *ngIf="!isLoading() && sales.length === 0">
               <td colspan="6" class="p-8 text-center text-slate-500 dark:text-slate-500 dark:text-slate-500">No hay ventas registradas.</td>
            </tr>
            <tr *ngFor="let sale of sales" class="border-b border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:bg-slate-900/5 dark:bg-white/5 transition-colors">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/10">{{ sale.customerName?.charAt(0) || 'C' }}</div>
                  <span class="font-medium text-slate-900 dark:text-white">{{ sale.customerName }}</span>
                </div>
              </td>
              <td class="p-4 text-sm">{{ sale.customerEmail || 'Sin correo' }}</td>
              <td class="p-4 font-mono font-medium text-slate-900 dark:text-white">\${{ sale.total | number:'1.2-2' }}</td>
              <td class="p-4">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold uppercase"
                  [ngClass]="{
                    'bg-green-500/10 text-green-400 border border-green-500/20': sale.status === 'COMPLETED',
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20': sale.status === 'PENDING',
                    'bg-red-500/10 text-red-400 border border-red-500/20': sale.status === 'CANCELLED',
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20': sale.status === 'REFUNDED'
                  }">
                  {{ sale.status }}
                </span>
              </td>
              <td class="p-4 text-sm text-slate-600 dark:text-slate-400">{{ sale.createdAt | date:'short' }}</td>
              <td class="p-4 text-right">
                <button class="w-8 h-8 rounded hover:bg-slate-100 dark:bg-slate-900/10 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"><i class="pi pi-pencil"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class LeadsComponent implements OnInit {
  private salesService = inject(SalesService);
  
  sales: any[] = [];
  isLoading = signal(true);

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.salesService.getAll(0, 50).subscribe({
        next: (res: any) => {
          this.sales = res.data || [];
          this.isLoading.set(false);
        },
        error: (err: any) => {
          console.error('Error fetching sales', err);
          this.isLoading.set(false);
        }
      });
    }
  }
}

