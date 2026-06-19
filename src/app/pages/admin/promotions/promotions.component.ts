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
    <div class="p-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Promociones</h2>
          <p class="text-sm text-slate-600 dark:text-slate-400">Crea y gestiona descuentos y ofertas especiales.</p>
        </div>
        <button
          (click)="openCreate()"
          class="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95">
          <i class="pi pi-plus text-sm"></i>
          Nueva Promoción
        </button>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Promociones</p>
          <p class="text-3xl font-bold text-slate-900 dark:text-white">{{ promotions().length }}</p>
        </div>
        <div class="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Activas</p>
          <p class="text-3xl font-bold text-green-400">{{ activeCount() }}</p>
        </div>
        <div class="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Inactivas</p>
          <p class="text-3xl font-bold text-slate-400">{{ promotions().length - activeCount() }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex justify-center py-16">
        <div class="flex flex-col items-center gap-3">
          <i class="pi pi-spin pi-spinner text-4xl text-purple-500"></i>
          <p class="text-sm text-slate-500 dark:text-slate-400">Cargando promociones...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && promotions().length === 0" class="text-center py-16">
        <div class="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-tag text-2xl text-purple-400"></i>
        </div>
        <p class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Sin promociones</p>
        <p class="text-sm text-slate-500 dark:text-slate-500 mb-6">Crea tu primera promoción para atraer más clientes.</p>
        <button (click)="openCreate()" class="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
          <i class="pi pi-plus mr-2"></i>Crear Promoción
        </button>
      </div>

      <!-- Promotions Grid -->
      <div *ngIf="!isLoading() && promotions().length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <div
          *ngFor="let promo of promotions()"
          class="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/5 group">
          <!-- Card Top -->
          <div class="p-5 relative">
            <!-- Active badge -->
            <div class="absolute top-4 right-4">
              <button
                (click)="toggleActive(promo)"
                class="relative inline-flex items-center w-10 h-5 rounded-full transition-all duration-300"
                [ngClass]="promo.isActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'">
                <span class="w-4 h-4 rounded-full bg-white shadow transition-transform duration-300"
                  [ngClass]="promo.isActive ? 'translate-x-5' : 'translate-x-0.5'"></span>
              </button>
            </div>

            <!-- Discount Badge -->
            <div
              *ngIf="promo.discountPercent"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold mb-3"
              [ngClass]="promo.isActive ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-white/5'">
              <i class="pi pi-percentage text-xs"></i>
              {{ promo.discountPercent }}% descuento
            </div>

            <h3 class="font-bold text-slate-900 dark:text-white mb-1 pr-12 truncate">{{ promo.title }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{{ promo.description || 'Sin descripción' }}</p>

            <!-- Code -->
            <div *ngIf="promo.code" class="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-white/5 mb-3">
              <i class="pi pi-ticket text-xs text-purple-400"></i>
              <code class="text-xs font-mono font-bold text-slate-900 dark:text-white tracking-wider">{{ promo.code }}</code>
            </div>

            <!-- Dates -->
            <div *ngIf="promo.startDate || promo.endDate" class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
              <i class="pi pi-calendar text-purple-400/70"></i>
              <span *ngIf="promo.startDate">{{ promo.startDate | date:'dd/MM/yy' }}</span>
              <span *ngIf="promo.startDate && promo.endDate">→</span>
              <span *ngIf="promo.endDate">{{ promo.endDate | date:'dd/MM/yy' }}</span>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="px-5 py-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-200/50 dark:bg-white/[0.02]">
            <span
              class="text-xs font-semibold px-2 py-1 rounded-full"
              [ngClass]="promo.isActive ? 'bg-green-500/10 text-green-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'">
              {{ promo.isActive ? 'Activa' : 'Inactiva' }}
            </span>
            <div class="flex items-center gap-2">
              <button
                (click)="openEdit(promo)"
                class="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 flex items-center justify-center transition-colors"
                title="Editar">
                <i class="pi pi-pencil text-xs"></i>
              </button>
              <button
                (click)="confirmDelete(promo)"
                class="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                title="Eliminar">
                <i class="pi pi-trash text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== CREATE / EDIT MODAL ===== -->
    <div
      *ngIf="showModal()"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      (click)="closeModal()">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div
        class="relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ editingPromo ? 'Editar Promoción' : 'Nueva Promoción' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ editingPromo ? 'Modifica los datos.' : 'Completa la información de la nueva promoción.' }}</p>
          </div>
          <button (click)="closeModal()" class="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 flex items-center justify-center text-slate-500 transition-colors">
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-4">
          <!-- Title -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Título *</label>
            <input
              type="text"
              [(ngModel)]="form.title"
              placeholder="Ej: Descuento de Verano"
              class="w-full bg-white dark:bg-slate-800 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
              [ngClass]="formErrors.title ? 'border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-purple-500/50'">
            <p *ngIf="formErrors.title" class="text-red-400 text-xs mt-1">{{ formErrors.title }}</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Descripción</label>
            <textarea
              [(ngModel)]="form.description"
              rows="3"
              placeholder="Descripción de la promoción..."
              class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 transition-all resize-none"></textarea>
          </div>

          <!-- Discount & Code -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Descuento (%)</label>
              <input
                type="number"
                [(ngModel)]="form.discountPercent"
                placeholder="0"
                min="0"
                max="100"
                class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 transition-all">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Código de descuento</label>
              <input
                type="text"
                [(ngModel)]="form.code"
                placeholder="Ej: VERANO25"
                class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 transition-all uppercase">
            </div>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Fecha de inicio</label>
              <input
                type="date"
                [(ngModel)]="form.startDate"
                class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50 transition-all">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Fecha de fin</label>
              <input
                type="date"
                [(ngModel)]="form.endDate"
                class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50 transition-all">
            </div>
          </div>

          <!-- Active Toggle -->
          <div class="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
            <div>
              <p class="text-sm font-semibold text-slate-900 dark:text-white">Promoción Activa</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Los clientes podrán ver y usar esta promoción</p>
            </div>
            <button
              type="button"
              (click)="form.isActive = !form.isActive"
              class="relative inline-flex items-center w-12 h-6 rounded-full transition-all duration-300"
              [ngClass]="form.isActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'">
              <span class="w-5 h-5 rounded-full bg-white shadow transition-transform duration-300"
                [ngClass]="form.isActive ? 'translate-x-6' : 'translate-x-0.5'"></span>
            </button>
          </div>

          <!-- Error Banner -->
          <div *ngIf="saveError()" class="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ saveError() }}</span>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex gap-3 p-6 border-t border-slate-200 dark:border-white/5">
          <button
            (click)="closeModal()"
            class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold transition-colors text-sm">
            Cancelar
          </button>
          <button
            (click)="savePromo()"
            [disabled]="isSaving()"
            class="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all duration-200 disabled:opacity-60 text-sm flex items-center justify-center gap-2">
            <i *ngIf="isSaving()" class="pi pi-spin pi-spinner text-sm"></i>
            <i *ngIf="!isSaving()" class="pi pi-check text-sm"></i>
            {{ isSaving() ? 'Guardando...' : (editingPromo ? 'Actualizar' : 'Crear Promoción') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== DELETE CONFIRMATION MODAL ===== -->
    <div
      *ngIf="showDeleteModal()"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      (click)="showDeleteModal.set(false)">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div
        class="relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6"
        (click)="$event.stopPropagation()">
        <div class="text-center mb-6">
          <div class="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-trash text-2xl text-red-400"></i>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Eliminar Promoción</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            ¿Eliminar <span class="font-semibold text-slate-700 dark:text-slate-300">{{ promoToDelete?.title }}</span>? Esta acción no se puede deshacer.
          </p>
        </div>
        <div class="flex gap-3">
          <button
            (click)="showDeleteModal.set(false)"
            class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold transition-colors text-sm">
            Cancelar
          </button>
          <button
            (click)="deletePromo()"
            [disabled]="isDeleting()"
            class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors text-sm flex items-center justify-center gap-2">
            <i *ngIf="isDeleting()" class="pi pi-spin pi-spinner text-sm"></i>
            {{ isDeleting() ? 'Eliminando...' : 'Sí, Eliminar' }}
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

  formErrors: { title?: string } = {};

  ngOnInit() {
    this.loadPromos();
  }

  loadPromos() {
    this.isLoading.set(true);
    this.promotionsService.getAll().subscribe({
      next: (res: any) => {
        this.promotions.set(res.data || res || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  activeCount() { return this.promotions().filter(p => p.isActive).length; }

  openCreate() {
    this.editingPromo = null;
    this.form = { title: '', description: '', discountPercent: 0, code: '', startDate: '', endDate: '', isActive: true };
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
    if (!this.form.title.trim()) this.formErrors.title = 'El título es obligatorio.';
    return Object.keys(this.formErrors).length === 0;
  }

  savePromo() {
    if (!this.validateForm()) return;
    this.isSaving.set(true);
    this.saveError.set('');

    const payload = {
      ...this.form,
      discountPercent: Number(this.form.discountPercent),
      startDate: this.form.startDate || undefined,
      endDate: this.form.endDate || undefined
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
        this.saveError.set(err?.error?.message || 'Error al guardar la promoción.');
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
      error: () => { this.isDeleting.set(false); }
    });
  }

  toggleActive(promo: Promotion) {
    this.promotionsService.update(promo.id, { isActive: !promo.isActive }).subscribe({
      next: () => this.loadPromos()
    });
  }
}
