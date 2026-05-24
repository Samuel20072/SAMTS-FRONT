import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-web-pages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Páginas Web Activas</h2>
          <p class="text-sm text-slate-600 dark:text-slate-400">Gestiona y monitoriza el ecosistema de tus webs.</p>
        </div>
        <button class="bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <i class="pi pi-plus"></i>
          Nueva Página (IA)
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let page of pages" class="bg-slate-100 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 hover:border-slate-300 dark:border-white/10 transition-colors group cursor-pointer">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-white/5">
              <i class="pi pi-globe text-xl text-blue-400"></i>
            </div>
            <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
              <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
            </span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ page.title }}</h3>
          <p class="text-xs text-slate-600 dark:text-slate-400 mb-4">{{ page.url }}</p>
          
          <div class="flex items-center gap-4 text-sm text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-white/5 pt-4">
            <div class="flex flex-col">
              <span class="text-xs text-slate-500 dark:text-slate-500">Visitas/mes</span>
              <span class="font-semibold">{{ page.visits }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-slate-500 dark:text-slate-500">Conversión</span>
              <span class="font-semibold text-blue-400">{{ page.conversion }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WebPagesComponent {
  pages = [
    { title: 'Landing Principal SAMTS', url: 'samts.com', visits: '45.2K', conversion: '12.4%' },
    { title: 'Campaña Verano IA', url: 'promo.samts.com', visits: '12.8K', conversion: '18.2%' },
    { title: 'Tienda Oficial', url: 'shop.samts.com', visits: '8.4K', conversion: '8.1%' },
  ];
}
