import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LeadMagnetApiService,
  LeadResponse,
  LeadStatus,
  UpdateLeadStatusPayload,
} from '../../../services/api/lead-magnet-api.service';

interface StatusConfig {
  label: string;
  classes: string;
}

const STATUS_LABELS: Record<LeadStatus, StatusConfig> = {
  NEW:           { label: 'Nuevo',          classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  CONTACTED:     { label: 'Contactado',     classes: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  QUALIFIED:     { label: 'Calificado',     classes: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  PROPOSAL_SENT: { label: 'Propuesta',      classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  NEGOTIATION:   { label: 'Negociación',    classes: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  WON:           { label: 'Ganado',         classes: 'bg-green-500/10 text-green-400 border-green-500/20' },
  LOST:          { label: 'Perdido',        classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
  FOLLOW_UP:     { label: 'Seguimiento',    classes: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

const ALL_STATUSES = Object.keys(STATUS_LABELS) as LeadStatus[];

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="p-6 sm:p-8 max-w-full">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 class="text-2xl font-display font-bold text-slate-900 dark:text-white">CRM — Contactos Comerciales</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Leads captados desde Samuel AI, formularios y WhatsApp.</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            (click)="loadLeads()"
            class="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition-colors">
            <i class="pi pi-refresh" [class.animate-spin]="isLoading()"></i>
            Actualizar
          </button>
          <span class="text-xs text-slate-400 dark:text-slate-500">{{ leads().length }} contactos</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          *ngFor="let s of ['ALL', ...allStatuses]"
          (click)="setFilter(s)"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
          [class]="filterStatus() === s
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-500/50'">
          {{ s === 'ALL' ? 'Todos' : statusLabel(s) }}
          <span *ngIf="s !== 'ALL'" class="ml-1 opacity-60">({{ countByStatus(s) }})</span>
        </button>
      </div>

      <!-- Search -->
      <div class="relative mb-5">
        <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Buscar por nombre, correo, empresa o solución..."
          class="w-full max-w-md pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400" />
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex items-center justify-center py-20 text-blue-500">
        <i class="pi pi-spinner animate-spin text-3xl"></i>
      </div>

      <!-- Error -->
      <div *ngIf="error() && !isLoading()" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 mb-4">
        <i class="pi pi-exclamation-triangle"></i>
        <span>{{ error() }}</span>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading() && !error() && filteredLeads().length === 0" class="text-center py-20 text-slate-400">
        <i class="pi pi-inbox text-4xl mb-4 block opacity-40"></i>
        <p class="font-medium">No se encontraron contactos</p>
        <p class="text-sm opacity-70 mt-1">Prueba ajustando el filtro o la búsqueda.</p>
      </div>

      <!-- Table -->
      <div *ngIf="!isLoading() && filteredLeads().length > 0"
        class="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-white/5">
              <th class="px-4 py-3 font-semibold">Contacto</th>
              <th class="px-4 py-3 font-semibold">Solución</th>
              <th class="px-4 py-3 font-semibold">Fuente</th>
              <th class="px-4 py-3 font-semibold">Estado</th>
              <th class="px-4 py-3 font-semibold">Fecha</th>
              <th class="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-white/5">
            <ng-container *ngFor="let lead of filteredLeads()">
              <!-- Main Row -->
              <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                (click)="toggleExpand(lead.id)">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">
                      {{ lead.name.charAt(0).toUpperCase() || '?' }}
                    </div>
                    <div>
                      <p class="font-semibold text-sm text-slate-900 dark:text-white">{{ lead.name }}</p>
                      <p class="text-xs text-slate-500">{{ lead.email || lead.whatsapp }}</p>
                      <p *ngIf="lead.businessName" class="text-xs text-slate-400 italic">{{ lead.businessName }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="text-sm">{{ lead.solutionInterest || '—' }}</span>
                  <p *ngIf="lead.budget" class="text-xs text-slate-400 mt-0.5">Presupuesto: {{ lead.budget }}</p>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                    [ngClass]="lead.campaign === 'samuel_diagnostic'
                      ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'">
                    <i [class]="lead.campaign === 'samuel_diagnostic' ? 'pi pi-sparkles' : 'pi pi-globe'" class="text-[9px]"></i>
                    {{ lead.campaign === 'samuel_diagnostic' ? 'Samuel AI' : (lead.source || 'Web') }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <select
                    [ngModel]="lead.status"
                    (ngModelChange)="updateStatus(lead, $event)"
                    (click)="$event.stopPropagation()"
                    class="text-xs font-semibold px-2 py-1 rounded-lg border cursor-pointer bg-transparent transition-colors focus:outline-none"
                    [ngClass]="getStatusClasses(lead.status)">
                    <option *ngFor="let s of allStatuses" [value]="s"
                      class="bg-slate-900 text-white">{{ statusLabel(s) }}</option>
                  </select>
                </td>
                <td class="px-4 py-3 text-xs text-slate-500">
                  {{ lead.createdAt | date:'dd/MM/yy HH:mm' }}
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <a *ngIf="lead.whatsapp"
                      [href]="'https://wa.me/57' + lead.whatsapp"
                      target="_blank"
                      (click)="$event.stopPropagation()"
                      class="w-7 h-7 rounded-lg flex items-center justify-center bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                      title="Abrir WhatsApp">
                      <i class="pi pi-whatsapp text-xs"></i>
                    </a>
                    <a *ngIf="lead.email"
                      [href]="'mailto:' + lead.email"
                      (click)="$event.stopPropagation()"
                      class="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      title="Enviar correo">
                      <i class="pi pi-envelope text-xs"></i>
                    </a>
                    <button
                      (click)="$event.stopPropagation(); confirmDelete(lead)"
                      class="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Eliminar lead">
                      <i class="pi pi-trash text-xs"></i>
                    </button>
                    <button class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <i class="pi text-xs" [class]="expandedId() === lead.id ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Expanded Detail Row -->
              @if (expandedId() === lead.id) {
                <tr>
                  <td colspan="6" class="bg-slate-50 dark:bg-slate-800/30 px-4 py-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <!-- Lead details -->
                      <div class="space-y-2 text-sm">
                        <p class="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider mb-2">Detalles del diagnóstico</p>
                        <div *ngIf="lead.businessType" class="flex gap-2">
                          <span class="text-slate-400 w-28 flex-shrink-0">Tipo negocio:</span>
                          <span class="text-slate-700 dark:text-slate-300">{{ lead.businessType }}</span>
                        </div>
                        <div *ngIf="lead.mainProblem" class="flex gap-2">
                          <span class="text-slate-400 w-28 flex-shrink-0">Problema:</span>
                          <span class="text-slate-700 dark:text-slate-300">{{ lead.mainProblem }}</span>
                        </div>
                        <div *ngIf="lead.urgency" class="flex gap-2">
                          <span class="text-slate-400 w-28 flex-shrink-0">Urgencia:</span>
                          <span class="text-slate-700 dark:text-slate-300">{{ lead.urgency }}</span>
                        </div>
                        <div *ngIf="lead.details" class="flex gap-2">
                          <span class="text-slate-400 w-28 flex-shrink-0">Detalles:</span>
                          <span class="text-slate-700 dark:text-slate-300">{{ lead.details }}</span>
                        </div>
                        <div *ngIf="lead.nextAction" class="flex gap-2">
                          <span class="text-slate-400 w-28 flex-shrink-0">Próx. acción:</span>
                          <span class="text-slate-700 dark:text-slate-300">{{ lead.nextAction }}</span>
                        </div>
                      </div>

                      <!-- Notes editor -->
                      <div>
                        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                          Notas comerciales
                        </label>
                        <textarea
                          [(ngModel)]="editNotes[lead.id]"
                          rows="3"
                          placeholder="Añade notas sobre esta oportunidad..."
                          class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400 resize-none"></textarea>
                        <div class="flex justify-end mt-2">
                          <button
                            (click)="saveNotes(lead)"
                            class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5">
                            <i class="pi pi-save text-[10px]"></i>
                            Guardar notas
                          </button>
                        </div>
                      </div>

                    </div>
                  </td>
                </tr>
              }
            </ng-container>
          </tbody>
        </table>
      </div>

      <!-- Delete confirm modal -->
      @if (deleteTarget()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="deleteTarget.set(null)">
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl" (click)="$event.stopPropagation()">
            <div class="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-4">
              <i class="pi pi-trash text-xl"></i>
            </div>
            <h3 class="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">¿Eliminar contacto?</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
              Se eliminará permanentemente <strong class="text-slate-700 dark:text-slate-200">{{ deleteTarget()?.name }}</strong>. Esta acción no se puede deshacer.
            </p>
            <div class="flex gap-2">
              <button (click)="deleteTarget.set(null)" class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancelar
              </button>
              <button (click)="deleteLead()" class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
})
export class LeadsComponent implements OnInit {
  private leadApi = inject(LeadMagnetApiService);

  leads = signal<LeadResponse[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  filterStatus = signal<string>('ALL');
  searchQuery = '';
  expandedId = signal<string | null>(null);
  deleteTarget = signal<LeadResponse | null>(null);
  editNotes: Record<string, string> = {};

  readonly allStatuses = ALL_STATUSES;

  readonly filteredLeads = computed(() => {
    let list = this.leads();
    const filter = this.filterStatus();
    if (filter !== 'ALL') {
      list = list.filter((l) => l.status === filter);
    }
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

  ngOnInit() {
    this.loadLeads();
  }

  loadLeads(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.leadApi.getAllLeads().subscribe({
      next: (data) => {
        this.leads.set(data);
        // Pre-fill notes editor
        data.forEach((l) => {
          if (!(l.id in this.editNotes)) {
            this.editNotes[l.id] = l.notes || '';
          }
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading leads', err);
        this.error.set('No se pudieron cargar los contactos. Verifica que el backend esté activo y tu sesión sea válida.');
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
    return STATUS_LABELS[status as LeadStatus]?.label ?? status;
  }

  getStatusClasses(status: LeadStatus): string {
    return STATUS_LABELS[status]?.classes ?? 'border-slate-500/20 text-slate-400';
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

  saveNotes(lead: LeadResponse): void {
    const notes = this.editNotes[lead.id] ?? '';
    this.leadApi.updateLeadStatus(lead.id, { notes }).subscribe({
      next: (updated) => {
        this.leads.update((list) =>
          list.map((l) => (l.id === updated.id ? updated : l))
        );
      },
      error: (err) => console.error('Error saving notes', err),
    });
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
}
