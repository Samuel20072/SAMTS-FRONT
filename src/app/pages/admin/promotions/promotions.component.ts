import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionsService } from '../../../services/api/promotions.service';

interface Promotion {
  id: string;
  title: string;
  description?: string;
  discountPercent?: number;
  code?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  createdAt?: string;
}

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Promociones y Descuentos</h1>
          <p class="text-xs text-slate-500 mt-0.5">Campañas especiales de descuento para servicios digitales y software SAMTS.</p>
        </div>
        <button
          (click)="openCreate()"
          class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm">
          <i class="pi pi-plus text-xs"></i>
          Nueva Promoción
        </button>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Promociones</p>
          <p class="text-2xl font-bold text-slate-900">{{ promotions().length }}</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Activas</p>
          <p class="text-2xl font-bold text-emerald-700">{{ activeCount() }}</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Inactivas o Expiradas</p>
          <p class="text-2xl font-bold text-slate-500">{{ promotions().length - activeCount() }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="py-16 text-center">
        <i class="pi pi-spinner animate-spin text-3xl text-blue-600"></i>
        <p class="text-xs text-slate-400 mt-2">Cargando promociones...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && promotions().length === 0" class="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <i class="pi pi-tag text-xl"></i>
        </div>
        <h3 class="text-sm font-bold text-slate-800">No hay promociones registradas</h3>
        <p class="text-xs text-slate-400 mt-1 mb-4">Crea una campaña con código de descuento para incentivar el cierre de ventas.</p>
        <button (click)="openCreate()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <i class="pi pi-plus text-xs mr-1"></i>Crear Primera Promoción
        </button>
      </div>

      <!-- Promotions Grid -->
      <div *ngIf="!isLoading() && promotions().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let promo of promotions()"
          class="bg-white border rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between"
          [ngClass]="promo.isActive ? 'border-slate-200' : 'border-slate-200 opacity-75'">
          
          <!-- Card Top -->
          <div class="p-5 relative">
            <!-- Active toggle switch -->
            <div class="absolute top-4 right-4 flex items-center gap-2">
              <span class="text-[10px] font-semibold uppercase tracking-wider" [ngClass]="promo.isActive ? 'text-emerald-700' : 'text-slate-400'">
                {{ promo.isActive ? 'Activa' : 'Inactiva' }}
              </span>
              <button
                (click)="toggleActive(promo)"
                class="relative inline-flex items-center w-9 h-5 rounded-full transition-colors"
                [ngClass]="promo.isActive ? 'bg-emerald-600' : 'bg-slate-300'">
                <span class="w-3.5 h-3.5 rounded-full bg-white shadow transition-transform"
                  [ngClass]="promo.isActive ? 'translate-x-4.5' : 'translate-x-0.5'"></span>
              </button>
            </div>

            <!-- Discount Percent Badge -->
            <div *ngIf="promo.discountPercent" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 mb-2.5">
              <i class="pi pi-percentage text-[10px]"></i>
              <span>{{ promo.discountPercent }}% Descuento</span>
            </div>

            <h3 class="font-bold text-slate-900 text-sm mb-1 pr-14 truncate">{{ promo.title }}</h3>
            <p class="text-xs text-slate-500 line-clamp-2 mb-3 min-h-[32px]">{{ promo.description || 'Sin descripción detallada.' }}</p>

            <!-- Code & Dates -->
            <div class="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-slate-100">
              <div *ngIf="promo.code" class="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded border border-slate-200">
                <i class="pi pi-ticket text-[10px] text-slate-500"></i>
                <code class="font-mono font-bold text-slate-800 text-[11px]">{{ promo.code }}</code>
              </div>

              <div *ngIf="promo.startDate || promo.endDate" class="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <i class="pi pi-calendar text-[10px]"></i>
                <span *ngIf="promo.startDate">{{ promo.startDate | date:'shortDate' }}</span>
                <span *ngIf="promo.startDate && promo.endDate">→</span>
                <span *ngIf="promo.endDate">{{ promo.endDate | date:'shortDate' }}</span>
              </div>
            </div>
          </div>

          <!-- Card Footer Actions -->
          <div class="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-1.5">
            <button
              (click)="openEdit(promo)"
              class="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 flex items-center justify-center transition-colors text-xs"
              title="Editar">
              <i class="pi pi-pencil"></i>
            </button>
            <button
              (click)="confirmDelete(promo)"
              class="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-colors text-xs"
              title="Eliminar">
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" (click)="closeModal()">
      <div class="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" (click)="$event.stopPropagation()">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 class="text-base font-bold text-slate-900">{{ editingPromo ? 'Editar Promoción' : 'Nueva Promoción Comercial' }}</h3>
            <p class="text-xs text-slate-500 mt-0.5">Define los parámetros de descuento y vigencia para clientes.</p>
          </div>
          <button (click)="closeModal()" class="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-4 text-xs">
          <!-- Title -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Título de la Promoción *</label>
            <input
              type="text"
              [(ngModel)]="form.title"
              placeholder="Ej: Descuento Lanzamiento Catálogo Digital"
              class="w-full px-3 py-2 border rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              [ngClass]="formErrors.title ? 'border-red-500' : 'border-slate-200'">
            <p *ngIf="formErrors.title" class="text-rose-600 text-[11px] mt-1">{{ formErrors.title }}</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Descripción</label>
            <textarea
              [(ngModel)]="form.description"
              rows="2"
              placeholder="Condiciones de la oferta..."
              class="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 resize-none"></textarea>
          </div>

          <!-- Percent & Code -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Porcentaje de Descuento (1 - 100)</label>
              <input
                type="number"
                [(ngModel)]="form.discountPercent"
                placeholder="20"
                min="1"
                max="100"
                class="w-full px-3 py-2 border rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                [ngClass]="formErrors.discountPercent ? 'border-red-500' : 'border-slate-200'">
              <p *ngIf="formErrors.discountPercent" class="text-rose-600 text-[11px] mt-1">{{ formErrors.discountPercent }}</p>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Código de Promoción</label>
              <input
                type="text"
                [(ngModel)]="form.code"
                placeholder="Ej: SAMTS20"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs uppercase font-mono text-slate-900 focus:outline-none focus:border-blue-500">
            </div>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Fecha de Inicio</label>
              <input
                type="date"
                [(ngModel)]="form.startDate"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Fecha de Finalización</label>
              <input
                type="date"
                [(ngModel)]="form.endDate"
                class="w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                [ngClass]="formErrors.dates ? 'border-red-500' : 'border-slate-200'">
            </div>
          </div>
          <p *ngIf="formErrors.dates" class="text-rose-600 text-[11px] -mt-2">{{ formErrors.dates }}</p>

          <!-- Active Toggle -->
          <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <p class="font-semibold text-slate-800 text-xs">Promoción Activa</p>
              <p class="text-[11px] text-slate-400">Disponible para ser aplicada en cotizaciones.</p>
            </div>
            <button
              type="button"
              (click)="form.isActive = !form.isActive"
              class="relative inline-flex items-center w-10 h-5 rounded-full transition-colors"
              [ngClass]="form.isActive ? 'bg-emerald-600' : 'bg-slate-300'">
              <span class="w-4 h-4 rounded-full bg-white shadow transition-transform"
                [ngClass]="form.isActive ? 'translate-x-5' : 'translate-x-0.5'"></span>
            </button>
          </div>

          <!-- Save Error -->
          <div *ngIf="saveError()" class="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <i class="pi pi-exclamation-circle text-rose-500"></i>
            <span>{{ saveError() }}</span>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50">
          <button
            (click)="closeModal()"
            class="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-white rounded-lg text-xs font-semibold transition-colors">
            Cancelar
          </button>
          <button
            (click)="savePromo()"
            [disabled]="isSaving()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
            <i *ngIf="isSaving()" class="pi pi-spinner animate-spin text-xs"></i>
            <i *ngIf="!isSaving()" class="pi pi-check text-xs"></i>
            <span>{{ isSaving() ? 'Guardando...' : (editingPromo ? 'Guardar Cambios' : 'Crear Promoción') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div *ngIf="showDeleteModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" (click)="showDeleteModal.set(false)">
      <div class="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm p-5" (click)="$event.stopPropagation()">
        <div class="text-center mb-4">
          <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <i class="pi pi-trash text-xl"></i>
          </div>
          <h3 class="text-sm font-bold text-slate-900 mb-1">¿Eliminar promoción?</h3>
          <p class="text-xs text-slate-500">
            Se eliminará <strong class="text-slate-800">{{ promoToDelete?.title }}</strong> de forma permanente.
          </p>
        </div>
        <div class="flex gap-2">
          <button
            (click)="showDeleteModal.set(false)"
            class="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            (click)="deletePromo()"
            [disabled]="isDeleting()"
            class="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
            <i *ngIf="isDeleting()" class="pi pi-spinner animate-spin text-xs"></i>
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class PromotionsComponent implements OnInit {
  private promotionsService = inject(PromotionsService);

  promotions = signal<Promotion[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  showDeleteModal = signal(false);
  isSaving = signal(false);
  isDeleting = signal(false);
  saveError = signal('');

  editingPromo: Promotion | null = null;
  promoToDelete: Promotion | null = null;

  form = {
    title: '',
    description: '',
    discountPercent: 0,
    code: '',
    startDate: '',
    endDate: '',
    isActive: true
  };

  formErrors: { title?: string; discountPercent?: string; dates?: string } = {};

  ngOnInit() {
    this.loadPromos();
  }

  loadPromos() {
    this.isLoading.set(true);
    this.promotionsService.getAll().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        this.promotions.set(list);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading promotions', err);
        this.isLoading.set(false);
      }
    });
  }

  activeCount() {
    return this.promotions().filter(p => p.isActive).length;
  }

  openCreate() {
    this.editingPromo = null;
    this.form = {
      title: '',
      description: '',
      discountPercent: 15,
      code: 'SAMTS15',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      isActive: true
    };
    this.formErrors = {};
    this.saveError.set('');
    this.showModal.set(true);
  }

  openEdit(promo: Promotion) {
    this.editingPromo = promo;
    this.form = {
      title: promo.title,
      description: promo.description || '',
      discountPercent: promo.discountPercent || 0,
      code: promo.code || '',
      startDate: promo.startDate ? promo.startDate.substring(0, 10) : '',
      endDate: promo.endDate ? promo.endDate.substring(0, 10) : '',
      isActive: promo.isActive ?? true
    };
    this.formErrors = {};
    this.saveError.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingPromo = null;
  }

  validateForm(): boolean {
    this.formErrors = {};
    if (!this.form.title.trim()) {
      this.formErrors.title = 'El título de la promoción es obligatorio.';
    }
    const percent = Number(this.form.discountPercent);
    if (percent !== undefined && percent !== null && (percent < 0 || percent > 100)) {
      this.formErrors.discountPercent = 'El descuento debe estar entre 1% y 100%.';
    }
    if (this.form.startDate && this.form.endDate && this.form.endDate < this.form.startDate) {
      this.formErrors.dates = 'La fecha de fin no puede ser anterior a la de inicio.';
    }
    return Object.keys(this.formErrors).length === 0;
  }

  savePromo() {
    if (!this.validateForm()) return;
    this.isSaving.set(true);
    this.saveError.set('');

    const payload = {
      title: this.form.title.trim(),
      description: this.form.description?.trim() || undefined,
      discountPercent: this.form.discountPercent ? Number(this.form.discountPercent) : undefined,
      code: this.form.code?.trim().toUpperCase() || undefined,
      startDate: this.form.startDate || undefined,
      endDate: this.form.endDate || undefined,
      isActive: this.form.isActive
    };

    const req = this.editingPromo
      ? this.promotionsService.update(this.editingPromo.id, payload)
      : this.promotionsService.create(payload);

    req.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
        this.loadPromos();
      },
      error: (err: any) => {
        this.isSaving.set(false);
        this.saveError.set(err?.error?.message || 'Error al guardar la promoción en la base de datos.');
      }
    });
  }

  confirmDelete(promo: Promotion) {
    this.promoToDelete = promo;
    this.showDeleteModal.set(true);
  }

  deletePromo() {
    if (!this.promoToDelete) return;
    this.isDeleting.set(true);
    this.promotionsService.delete(this.promoToDelete.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.promoToDelete = null;
        this.loadPromos();
      },
      error: () => {
        this.isDeleting.set(false);
      }
    });
  }

  toggleActive(promo: Promotion) {
    this.promotionsService.update(promo.id, { isActive: !promo.isActive }).subscribe({
      next: () => this.loadPromos(),
      error: (err) => console.error('Error toggling promo status', err)
    });
  }
}
