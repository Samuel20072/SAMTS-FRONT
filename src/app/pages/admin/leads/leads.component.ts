import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-display font-bold text-slate-900 dark:text-white">Gestión de Leads & CRM</h2>
        <button class="bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <i class="pi pi-plus"></i>
          Nuevo Lead
        </button>
      </div>
      
      <div class="bg-slate-100 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-200 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-white/5">
              <th class="p-4 font-medium">Nombre</th>
              <th class="p-4 font-medium">Contacto</th>
              <th class="p-4 font-medium">Estado</th>
              <th class="p-4 font-medium">Origen (IA)</th>
              <th class="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-slate-700 dark:text-slate-300">
            <tr *ngFor="let lead of leads" class="border-b border-slate-200 dark:border-white/5 hover:bg-slate-900/5 dark:bg-white/5 transition-colors">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-medium">{{ lead.name.charAt(0) }}</div>
                  <span class="font-medium text-slate-900 dark:text-white">{{ lead.name }}</span>
                </div>
              </td>
              <td class="p-4 text-sm">{{ lead.email }}</td>
              <td class="p-4">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  [ngClass]="{
                    'bg-green-500/10 text-green-400 border border-green-500/20': lead.status === 'Cerrado',
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20': lead.status === 'Nuevo',
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20': lead.status === 'En Contacto'
                  }">
                  {{ lead.status }}
                </span>
              </td>
              <td class="p-4 text-sm text-slate-600 dark:text-slate-400"><i class="pi pi-sparkles text-blue-400 text-xs mr-1"></i> {{ lead.source }}</td>
              <td class="p-4 text-right">
                <button class="w-8 h-8 rounded hover:bg-slate-900/10 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"><i class="pi pi-pencil"></i></button>
                <button class="w-8 h-8 rounded hover:bg-red-500/20 text-slate-600 dark:text-slate-400 hover:text-red-400 transition-colors ml-1"><i class="pi pi-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class LeadsComponent {
  leads = [
    { name: 'Carlos Mendoza', email: 'carlos@empresa.com', status: 'Nuevo', source: 'Agente Ventas Web' },
    { name: 'Ana Silva', email: 'ana@startup.io', status: 'Cerrado', source: 'Campaña FB (IA)' },
    { name: 'Miguel Rojas', email: 'miguel@tienda.com', status: 'En Contacto', source: 'Agente WhatsApp' },
    { name: 'Elena Torres', email: 'elena@corp.net', status: 'Nuevo', source: 'Agente Ventas Web' },
    { name: 'Roberto Díaz', email: 'roberto@mail.com', status: 'Cerrado', source: 'Landing Page' },
  ];
}
