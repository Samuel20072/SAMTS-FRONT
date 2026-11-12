import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LeadMagnetApiService,
  LeadResponse,
  LeadStatus,
  UpdateLeadStatusPayload,
  CampaignStats,
  LeadActivity,
} from '../../../services/api/lead-magnet-api.service';

interface StatusConfig {
  label: string;
  classes: string;
}

const STATUS_CONFIGS: Record<LeadStatus, StatusConfig> = {
  NEW:           { label: 'Nuevo',          classes: 'bg-slate-100 text-slate-700 border-slate-200' },
  CONTACTED:     { label: 'Contactado',     classes: 'bg-sky-50 text-sky-700 border-sky-200' },
  QUALIFIED:     { label: 'Calificado',     classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  PROPOSAL_SENT: { label: 'Propuesta',      classes: 'bg-purple-50 text-purple-700 border-purple-200' },
  NEGOTIATION:   { label: 'Negociación',    classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  WON:           { label: 'Ganado',         classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  LOST:          { label: 'Perdido',        classes: 'bg-rose-50 text-rose-700 border-rose-200' },
  FOLLOW_UP:     { label: 'Seguimiento',    classes: 'bg-orange-50 text-orange-700 border-orange-200' },
  SELECTED:      { label: 'Seleccionado',   classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  WAITLIST:      { label: 'Lista Espera',   classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  ACTIVATED:     { label: 'Activado',       classes: 'bg-teal-50 text-teal-700 border-teal-200' },
};

const ALL_STATUSES: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'WON',
  'LOST',
  'FOLLOW_UP'
];

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">CRM & Gestión de Prospectos</h1>
          <p class="text-xs text-slate-500 mt-0.5">Control de oportunidades comerciales, estados de venta y seguimiento de clientes SAMTS.</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            (click)="exportToCsv()"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-sm">
            <i class="pi pi-download text-xs text-slate-500"></i>
            Exportar CSV
          </button>
          <button
            (click)="loadLeads()"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold transition-colors shadow-sm">
            <i class="pi pi-refresh text-xs" [class.animate-spin]="isLoading()"></i>
            Actualizar
          </button>
        </div>
      </div>

      <!-- Quick KPI Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Prospectos</span>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-bold text-slate-900">{{ leads().length }}</span>
            <span class="text-xs text-slate-400 font-mono">{{ countByStatus('NEW') }} nuevos</span>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">Pipeline Estimado</span>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-bold text-slate-900">\${{ totalPipelineValue() | number:'1.0-0' }}</span>
            <span class="text-xs text-blue-600 font-mono">{{ openDealsCount() }} abiertas</span>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">Clientes Ganados</span>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-bold text-emerald-700">{{ countByStatus('WON') }}</span>
            <span class="text-xs text-emerald-600 font-mono">\${{ wonRevenue() | number:'1.0-0' }}</span>
          </div>
        </div>

        <div class="bg-white border rounded-xl p-4 shadow-sm"
             [ngClass]="overdueFollowUps() > 0 ? 'border-orange-300 bg-orange-50/30' : 'border-slate-200'">
          <span class="text-[10px] font-bold uppercase tracking-wider block mb-1"
                [ngClass]="overdueFollowUps() > 0 ? 'text-orange-700' : 'text-slate-400'">
            Seguimientos Pendientes
          </span>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-bold" [ngClass]="overdueFollowUps() > 0 ? 'text-orange-800' : 'text-slate-900'">
              {{ overdueFollowUps() }}
            </span>
            <span *ngIf="overdueFollowUps() > 0" class="text-[10px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded">Atención</span>
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <!-- Status Tabs -->
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            (click)="setFilter('ALL')"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
            [class]="filterStatus() === 'ALL'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'">
            Todos ({{ leads().length }})
          </button>
          <button
            *ngFor="let s of allStatuses"
            (click)="setFilter(s)"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
            [class]="filterStatus() === s
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'">
            {{ statusLabel(s) }}
            <span class="ml-1 opacity-70">({{ countByStatus(s) }})</span>
          </button>
        </div>

        <!-- Search & Campaign Filter -->
        <div class="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
          <div class="relative flex-1 w-full">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Buscar por nombre, email, empresa, solución o teléfono..."
              class="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <span class="text-[11px] font-semibold text-slate-500 uppercase whitespace-nowrap">Origen:</span>
            <select 
              [(ngModel)]="filterCampaign" 
              class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-slate-700 font-medium">
              <option value="ALL">Todas las fuentes</option>
              <option value="lanzamiento_20_dias">Catálogo Digital</option>
              <option value="samuel_diagnostic">Samuel AI Diagnóstico</option>
              <option value="consultation_modal">Modal Consulta Web</option>
              <option value="direct">Contacto Directo</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="py-20 text-center">
        <i class="pi pi-spinner animate-spin text-3xl text-blue-600"></i>
        <p class="text-xs text-slate-400 mt-2">Cargando prospectos...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error() && !isLoading()" class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="pi pi-exclamation-triangle text-base text-red-500"></i>
          <span>{{ error() }}</span>
        </div>
        <button (click)="loadLeads()" class="px-2.5 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700">Reintentar</button>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && !error() && filteredLeads().length === 0" class="text-center py-20 bg-white border border-slate-200 rounded-xl">
        <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <i class="pi pi-inbox text-2xl"></i>
        </div>
        <p class="text-sm font-semibold text-slate-800">No se encontraron prospectos</p>
        <p class="text-xs text-slate-400 mt-1">Ajusta los filtros o realiza una búsqueda distinta.</p>
      </div>

      <!-- Table View -->
      <div *ngIf="!isLoading() && filteredLeads().length > 0"
           class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th class="px-4 py-3">Prospecto / Empresa</th>
                <th class="px-4 py-3">Interés / Solución</th>
                <th class="px-4 py-3">Estado</th>
                <th class="px-4 py-3 text-right">Valor Est.</th>
                <th class="px-4 py-3">Responsable</th>
                <th class="px-4 py-3">Próx. Seguimiento</th>
                <th class="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <ng-container *ngFor="let lead of filteredLeads()">
                <!-- Main Row -->
                <tr class="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    [class.bg-blue-50]="expandedId() === lead.id"
                    (click)="toggleExpand(lead.id)">
                  
                  <!-- Contact / Company -->
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                        {{ lead.name.charAt(0).toUpperCase() || '?' }}
                      </div>
                      <div class="min-w-0">
                        <p class="font-semibold text-slate-900 truncate">{{ lead.name }}</p>
                        <p class="text-[11px] text-slate-400 truncate">{{ lead.email }}</p>
                        <p *ngIf="lead.businessName" class="text-[10px] text-blue-600 font-medium truncate">{{ lead.businessName }}</p>
                      </div>
                    </div>
                  </td>

                  <!-- Solution / Need -->
                  <td class="px-4 py-3">
                    <p class="font-medium text-slate-800 truncate max-w-[200px]">{{ lead.solutionInterest || lead.businessType || 'General' }}</p>
                    <span class="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500">
                      {{ lead.campaign || lead.source || 'Web' }}
                    </span>
                  </td>

                  <!-- Status Dropdown -->
                  <td class="px-4 py-3" (click)="$event.stopPropagation()">
                    <select
                      [ngModel]="lead.status"
                      (ngModelChange)="updateStatus(lead, $event)"
                      class="text-xs font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                      [ngClass]="getStatusClasses(lead.status)">
                      <option *ngFor="let s of allStatuses" [value]="s">{{ statusLabel(s) }}</option>
                    </select>
                  </td>

                  <!-- Estimated Value -->
                  <td class="px-4 py-3 text-right font-mono font-medium text-slate-800">
                    <span *ngIf="lead.estimatedValue">\${{ lead.estimatedValue | number:'1.0-0' }}</span>
                    <span *ngIf="!lead.estimatedValue" class="text-slate-300">-</span>
                  </td>

                  <!-- Assigned To -->
                  <td class="px-4 py-3 text-slate-600">
                    <span *ngIf="lead.assignedTo" class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                      <i class="pi pi-user text-[10px] text-slate-400"></i>
                      {{ lead.assignedTo }}
                    </span>
                    <span *ngIf="!lead.assignedTo" class="text-slate-300 text-[11px]">Sin asignar</span>
                  </td>

                  <!-- Follow up -->
                  <td class="px-4 py-3 text-[11px]">
                    <span *ngIf="lead.followUpDate" class="font-medium"
                          [ngClass]="isOverdue(lead.followUpDate) ? 'text-orange-600 font-bold' : 'text-slate-600'">
                      {{ lead.followUpDate | date:'shortDate' }}
                      <i *ngIf="isOverdue(lead.followUpDate)" class="pi pi-clock ml-1 text-[10px]"></i>
                    </span>
                    <span *ngIf="!lead.followUpDate" class="text-slate-300">-</span>
                  </td>

                  <!-- Actions -->
                  <td class="px-4 py-3 text-right" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-end gap-1">
                      <a *ngIf="lead.whatsapp"
                         [href]="getWhatsappUrl(lead)"
                         target="_blank"
                         class="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                         title="Contactar por WhatsApp">
                        <i class="pi pi-whatsapp text-xs"></i>
                      </a>
                      <a *ngIf="lead.email"
                         [href]="'mailto:' + lead.email + '?subject=' + getEmailSubject(lead)"
                         class="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                         title="Enviar Correo">
                        <i class="pi pi-envelope text-xs"></i>
                      </a>
                      <button
                        (click)="confirmDelete(lead)"
                        class="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Eliminar Lead">
                        <i class="pi pi-trash text-xs"></i>
                      </button>
                      <button (click)="toggleExpand(lead.id)" class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                        <i class="pi text-xs" [class]="expandedId() === lead.id ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Expanded Full CRM Ficha & Activity Row -->
                <tr *ngIf="expandedId() === lead.id" class="bg-slate-50/70 border-b border-slate-200">
                  <td colspan="7" class="p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      <!-- Col 1: Lead Information -->
                      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                        <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <i class="pi pi-id-card text-blue-600"></i>
                          Ficha del Prospecto
                        </h3>

                        <div class="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span class="text-[10px] text-slate-400 block">Negocio / Marca</span>
                            <span class="font-medium text-slate-800">{{ lead.businessName || 'No especificado' }}</span>
                          </div>
                          <div>
                            <span class="text-[10px] text-slate-400 block">Tipo de Negocio</span>
                            <span class="font-medium text-slate-800">{{ lead.businessType || 'General' }}</span>
                          </div>
                          <div>
                            <span class="text-[10px] text-slate-400 block">WhatsApp</span>
                            <span class="font-medium text-slate-800">{{ lead.whatsapp || 'Sin número' }}</span>
                          </div>
                          <div>
                            <span class="text-[10px] text-slate-400 block">Presupuesto</span>
                            <span class="font-medium text-slate-800">{{ lead.budget || 'Por cotizar' }}</span>
                          </div>
                        </div>

                        <div *ngIf="lead.mainProblem" class="pt-2 border-t border-slate-100">
                          <span class="text-[10px] text-slate-400 block">Principal Desafío:</span>
                          <p class="text-xs text-slate-700 mt-0.5">{{ lead.mainProblem }}</p>
                        </div>

                        <div *ngIf="lead.details" class="pt-2 border-t border-slate-100">
                          <span class="text-[10px] text-slate-400 block">Detalles adicionales:</span>
                          <p class="text-xs text-slate-700 mt-0.5 whitespace-pre-line">{{ lead.details }}</p>
                        </div>
                      </div>

                      <!-- Col 2: Commercial Fields & Notes -->
                      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                        <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <i class="pi pi-sliders-h text-blue-600"></i>
                          Gestión Comercial
                        </h3>

                        <div class="grid grid-cols-2 gap-2">
                          <div>
                            <label class="text-[10px] text-slate-500 font-semibold block mb-1">Valor Estimado ($)</label>
                            <input
                              type="number"
                              [(ngModel)]="editForm[lead.id].estimatedValue"
                              placeholder="0"
                              class="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 font-mono focus:border-blue-500 focus:outline-none" />
                          </div>
                          <div>
                            <label class="text-[10px] text-slate-500 font-semibold block mb-1">Responsable</label>
                            <input
                              type="text"
                              [(ngModel)]="editForm[lead.id].assignedTo"
                              placeholder="Ej: Samuel, Ventas"
                              class="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 focus:border-blue-500 focus:outline-none" />
                          </div>
                          <div>
                            <label class="text-[10px] text-slate-500 font-semibold block mb-1">Etapa del Negocio</label>
                            <select
                              [(ngModel)]="editForm[lead.id].dealStage"
                              class="w-full px-2 py-1.5 text-xs rounded border border-slate-200 focus:border-blue-500 focus:outline-none">
                              <option value="PROSPECTION">Prospección</option>
                              <option value="CONTACT">Primer Contacto</option>
                              <option value="DIAGNOSIS">Diagnóstico</option>
                              <option value="PROPOSAL">Propuesta</option>
                              <option value="NEGOTIATION">Negociación</option>
                              <option value="CLOSING">Cierre</option>
                            </select>
                          </div>
                          <div>
                            <label class="text-[10px] text-slate-500 font-semibold block mb-1">Fecha Seguimiento</label>
                            <input
                              type="date"
                              [(ngModel)]="editForm[lead.id].followUpDate"
                              class="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 focus:border-blue-500 focus:outline-none" />
                          </div>
                        </div>

                        <div>
                          <label class="text-[10px] text-slate-500 font-semibold block mb-1">Próxima Acción Concreta</label>
                          <input
                            type="text"
                            [(ngModel)]="editForm[lead.id].nextAction"
                            placeholder="Ej: Enviar demo interactiva de tienda..."
                            class="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 focus:border-blue-500 focus:outline-none" />
                        </div>

                        <div>
                          <label class="text-[10px] text-slate-500 font-semibold block mb-1">Notas Internas</label>
                          <textarea
                            [(ngModel)]="editForm[lead.id].notes"
                            rows="2"
                            placeholder="Historial de acuerdos, preferencias..."
                            class="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 focus:border-blue-500 focus:outline-none resize-none"></textarea>
                        </div>

                        <div class="flex justify-end pt-2">
                          <button
                            (click)="saveCommercialData(lead)"
                            class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5">
                            <i class="pi pi-check text-[10px]"></i>
                            Guardar Cambios
                          </button>
                        </div>
                      </div>

                      <!-- Col 3: Activity History & New Log -->
                      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 flex flex-col">
                        <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <i class="pi pi-history text-blue-600"></i>
                          Historial de Actividades
                        </h3>

                        <!-- Add Activity Form -->
                        <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                          <div class="flex gap-2">
                            <select
                              [(ngModel)]="newActivity[lead.id].type"
                              class="text-[11px] px-2 py-1 bg-white border border-slate-200 rounded font-semibold text-slate-700">
                              <option value="NOTE">Nota</option>
                              <option value="CALL">Llamada</option>
                              <option value="WHATSAPP">WhatsApp</option>
                              <option value="MEETING">Reunión</option>
                            </select>
                            <input
                              type="text"
                              [(ngModel)]="newActivity[lead.id].description"
                              placeholder="Describir actividad..."
                              class="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-500" />
                          </div>
                          <div class="flex justify-end">
                            <button
                              (click)="addActivity(lead)"
                              [disabled]="!newActivity[lead.id]?.description?.trim()"
                              class="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white rounded text-[11px] font-semibold transition-colors">
                              Registrar Actividad
                            </button>
                          </div>
                        </div>

                        <!-- Activity Timeline List -->
                        <div class="flex-1 overflow-y-auto max-h-48 space-y-2 pr-1">
                          <div *ngIf="!lead.activityHistory || lead.activityHistory.length === 0" class="text-center py-6 text-slate-400">
                            <i class="pi pi-clock text-lg mb-1 block"></i>
                            <span class="text-[11px]">Sin actividades registradas</span>
                          </div>

                          <div *ngFor="let act of (lead.activityHistory || [])" class="p-2 rounded bg-slate-50 border border-slate-100 text-xs">
                            <div class="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span class="font-bold text-blue-600 uppercase">{{ act.type }}</span>
                              <span>{{ act.date | date:'dd/MM/yy HH:mm' }}</span>
                            </div>
                            <p class="text-slate-800 text-[11px]">{{ act.description }}</p>
                            <span *ngIf="act.author" class="text-[10px] text-slate-400 mt-1 block">Por: {{ act.author }}</span>
                          </div>
                        </div>

                      </div>

                    </div>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div *ngIf="deleteTarget()" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <i class="pi pi-trash text-xl"></i>
          </div>
          <h3 class="text-base font-bold text-center text-slate-900 mb-1">¿Eliminar este prospecto?</h3>
          <p class="text-xs text-slate-500 text-center mb-6">
            Se eliminará el registro de <strong class="text-slate-800">{{ deleteTarget()?.name }}</strong> de la base de datos de SAMTS. Esta acción no se puede deshacer.
          </p>
          <div class="flex gap-2">
            <button (click)="deleteTarget.set(null)" class="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button (click)="deleteLead()" class="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors">
              Confirmar Eliminación
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class LeadsComponent implements OnInit {
  private leadApi = inject(LeadMagnetApiService);

  leads = signal<LeadResponse[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  filterStatus = signal<string>('ALL');
  filterCampaign = 'ALL';
  searchQuery = '';
  expandedId = signal<string | null>(null);
  deleteTarget = signal<LeadResponse | null>(null);

  editForm: Record<string, {
    estimatedValue?: number;
    assignedTo?: string;
    dealStage?: string;
    followUpDate?: string;
    nextAction?: string;
    notes?: string;
  }> = {};

  newActivity: Record<string, {
    type: string;
    description: string;
    author: string;
  }> = {};

  readonly allStatuses = ALL_STATUSES;

  readonly filteredLeads = computed(() => {
    let list = this.leads();
    
    // Status Filter
    const filter = this.filterStatus();
    if (filter !== 'ALL') {
      list = list.filter((l) => l.status === filter);
    }
    
    // Campaign Filter
    const camp = this.filterCampaign;
    if (camp !== 'ALL') {
      list = list.filter((l) => l.campaign === camp);
    }

    // Search Query
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.businessName?.toLowerCase().includes(q) ||
          l.solutionInterest?.toLowerCase().includes(q) ||
          l.whatsapp?.includes(q)
      );
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  totalPipelineValue = computed(() => {
    return this.leads()
      .filter((l) => ['QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION'].includes(l.status))
      .reduce((acc, curr) => acc + (Number(curr.estimatedValue) || 0), 0);
  });

  openDealsCount = computed(() => {
    return this.leads().filter((l) => ['QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION'].includes(l.status)).length;
  });

  wonRevenue = computed(() => {
    return this.leads()
      .filter((l) => l.status === 'WON')
      .reduce((acc, curr) => acc + (Number(curr.estimatedValue) || 0), 0);
  });

  overdueFollowUps = computed(() => {
    const today = new Date().toISOString().substring(0, 10);
    return this.leads().filter(
      (l) => l.followUpDate && l.followUpDate <= today && l.status !== 'WON' && l.status !== 'LOST'
    ).length;
  });

  ngOnInit() {
    this.loadLeads();
  }

  loadLeads(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.leadApi.getAllLeads().subscribe({
      next: (data) => {
        this.leads.set(data);
        data.forEach((l) => {
          if (!this.editForm[l.id]) {
            this.editForm[l.id] = {
              estimatedValue: l.estimatedValue,
              assignedTo: l.assignedTo || '',
              dealStage: l.dealStage || 'PROSPECTION',
              followUpDate: l.followUpDate ? l.followUpDate.substring(0, 10) : '',
              nextAction: l.nextAction || '',
              notes: l.notes || '',
            };
          }
          if (!this.newActivity[l.id]) {
            this.newActivity[l.id] = {
              type: 'NOTE',
              description: '',
              author: 'Admin SAMTS',
            };
          }
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading leads', err);
        this.error.set('No se pudieron cargar los contactos. Verifica tu sesión y conectividad.');
        this.isLoading.set(false);
      },
    });
  }

  setFilter(status: string): void {
    this.filterStatus.set(status);
  }

  countByStatus(status: string): number {
    return this.leads().filter((l) => l.status === status).length;
  }

  statusLabel(status: string): string {
    return STATUS_CONFIGS[status as LeadStatus]?.label ?? status;
  }

  getStatusClasses(status: LeadStatus): string {
    return STATUS_CONFIGS[status]?.classes ?? 'bg-slate-100 text-slate-700 border-slate-200';
  }

  isOverdue(dateStr?: string): boolean {
    if (!dateStr) return false;
    const today = new Date().toISOString().substring(0, 10);
    return dateStr <= today;
  }

  toggleExpand(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  updateStatus(lead: LeadResponse, newStatus: LeadStatus): void {
    const payload: UpdateLeadStatusPayload = { status: newStatus };
    this.leadApi.updateLeadStatus(lead.id, payload).subscribe({
      next: (updated) => {
        this.leads.update((list) =>
          list.map((l) => (l.id === updated.id ? updated : l))
        );
      },
      error: (err) => console.error('Error updating status', err),
    });
  }

  saveCommercialData(lead: LeadResponse): void {
    const form = this.editForm[lead.id];
    if (!form) return;

    const payload: UpdateLeadStatusPayload = {
      estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : undefined,
      assignedTo: form.assignedTo,
      dealStage: form.dealStage,
      followUpDate: form.followUpDate,
      nextAction: form.nextAction,
      notes: form.notes,
    };

    this.leadApi.updateLeadStatus(lead.id, payload).subscribe({
      next: (updated) => {
        this.leads.update((list) =>
          list.map((l) => (l.id === updated.id ? updated : l))
        );
      },
      error: (err) => console.error('Error saving commercial data', err),
    });
  }

  addActivity(lead: LeadResponse): void {
    const act = this.newActivity[lead.id];
    if (!act || !act.description.trim()) return;

    const payload: UpdateLeadStatusPayload = {
      activityEntry: {
        type: act.type,
        description: act.description.trim(),
        author: act.author || 'Admin SAMTS',
      },
    };

    this.leadApi.updateLeadStatus(lead.id, payload).subscribe({
      next: (updated) => {
        this.leads.update((list) =>
          list.map((l) => (l.id === updated.id ? updated : l))
        );
        this.newActivity[lead.id].description = '';
      },
      error: (err) => console.error('Error adding activity', err),
    });
  }

  getWhatsappUrl(lead: LeadResponse): string {
    const phone = (lead.whatsapp || '').replace(/\D/g, '');
    const cleanPhone = phone.startsWith('52') || phone.startsWith('57') ? phone : `52${phone}`;
    const name = lead.name || 'Hola';
    const text = encodeURIComponent(
      `Hola ${name}, te contactamos desde SAMTS en relación con tu consulta sobre ${lead.solutionInterest || 'soluciones digitales'}. ¿Cómo podemos ayudarte hoy?`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  }

  getEmailSubject(lead: LeadResponse): string {
    return encodeURIComponent(`Propuesta y seguimiento SAMTS para ${lead.businessName || lead.name}`);
  }

  confirmDelete(lead: LeadResponse): void {
    this.deleteTarget.set(lead);
  }

  deleteLead(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.leadApi.deleteLead(target.id).subscribe({
      next: () => {
        this.leads.update((list) => list.filter((l) => l.id !== target.id));
        this.deleteTarget.set(null);
        if (this.expandedId() === target.id) this.expandedId.set(null);
      },
      error: (err) => console.error('Error deleting lead', err),
    });
  }

  exportToCsv(): void {
    const data = this.filteredLeads();
    if (data.length === 0) return;

    const headers = [
      'ID', 'Nombre', 'Email', 'WhatsApp', 'Empresa', 'Tipo Negocio', 
      'Interes', 'Estado', 'Valor Estimado', 'Responsable', 'Etapa',
      'Proxima Accion', 'Fecha Seguimiento', 'Fecha Creacion', 'Notas'
    ];

    const rows = data.map(l => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      l.email || '',
      l.whatsapp || '',
      `"${(l.businessName || '').replace(/"/g, '""')}"`,
      `"${(l.businessType || '').replace(/"/g, '""')}"`,
      `"${(l.solutionInterest || '').replace(/"/g, '""')}"`,
      l.status,
      l.estimatedValue || 0,
      `"${(l.assignedTo || '').replace(/"/g, '""')}"`,
      l.dealStage || '',
      `"${(l.nextAction || '').replace(/"/g, '""')}"`,
      l.followUpDate || '',
      new Date(l.createdAt).toISOString(),
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_samts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
