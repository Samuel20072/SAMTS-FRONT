import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../../services/api/products.service';

interface Service {
  id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  category: string;
  priceType?: string;      // 'unique' | 'monthly' | 'annual'
  features?: string[];     // Lista de características incluidas
  deliveryTime?: string;   // Ej: '2-4 semanas'
  featured?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

const CATEGORIES = ['Página Web', 'Agente IA', 'Paquete Completo', 'Mantenimiento'];
const PRICE_TYPES = [
  { value: 'unique',  label: 'Pago único' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'annual',  label: 'Anual' }
];

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8">

      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Servicios & Productos</h2>
          <p class="text-sm text-slate-600 dark:text-slate-400">Catálogo de servicios que SAMTS ofrece a sus clientes.</p>
        </div>
        <button
          (click)="openCreate()"
          class="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95">
          <i class="pi pi-plus text-sm"></i>
          Nuevo Servicio
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Servicios</p>
          <p class="text-3xl font-bold text-slate-900 dark:text-white">{{ services().length }}</p>
        </div>
        <div class="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Activos</p>
          <p class="text-3xl font-bold text-green-400">{{ activeCount() }}</p>
        </div>
        <div class="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Destacados</p>
          <p class="text-3xl font-bold text-yellow-400">{{ featuredCount() }}</p>
        </div>
        <div class="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Suscripciones</p>
          <p class="text-3xl font-bold text-blue-400">{{ subscriptionCount() }}</p>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          *ngFor="let cat of ['Todos', ...CATEGORIES]"
          (click)="setCategoryFilter(cat === 'Todos' ? '' : cat)"
          class="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border"
          [ngClass]="categoryFilter === (cat === 'Todos' ? '' : cat)
            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
            : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:border-blue-500/30'">
          {{ cat }}
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex justify-center py-16">
        <div class="flex flex-col items-center gap-3">
          <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
          <p class="text-sm text-slate-500 dark:text-slate-400">Cargando servicios...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && filtered().length === 0" class="text-center py-16">
        <div class="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-briefcase text-2xl text-blue-400"></i>
        </div>
        <p class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Sin servicios en esta categoría</p>
        <p class="text-sm text-slate-500 dark:text-slate-500 mb-6">Crea tu primer servicio para mostrarlo a tus clientes.</p>
        <button (click)="openCreate()" class="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
          <i class="pi pi-plus mr-2"></i>Crear Servicio
        </button>
      </div>

      <!-- Service Cards Grid -->
      <div *ngIf="!isLoading() && filtered().length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <div
          *ngFor="let svc of filtered()"
          class="relative bg-slate-100 dark:bg-slate-900/60 border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl group flex flex-col"
          [ngClass]="svc.featured
            ? 'border-yellow-400/40 hover:border-yellow-400/60 hover:shadow-yellow-500/10'
            : 'border-slate-200 dark:border-white/5 hover:border-blue-500/30 hover:shadow-blue-500/5'">

          <!-- Featured ribbon -->
          <div *ngIf="svc.featured" class="absolute top-3 right-3 z-10">
            <span class="flex items-center gap-1 px-2 py-1 bg-yellow-400/15 text-yellow-400 border border-yellow-400/30 rounded-full text-xs font-bold">
              <i class="pi pi-star-fill text-[9px]"></i> Destacado
            </span>
          </div>

          <!-- Card Body -->
          <div class="p-5 flex-1">
            <!-- Category & Type badges -->
            <div class="flex items-center gap-2 mb-3">
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold border"
                [ngClass]="categoryColor(svc.category)">
                <i class="mr-1 text-[10px]" [ngClass]="categoryIcon(svc.category)"></i>{{ svc.category }}
              </span>
              <span class="px-2 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/5">
                {{ priceTypeLabel(svc.priceType) }}
              </span>
            </div>

            <!-- Name & Description -->
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1 pr-14">{{ svc.name }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{{ svc.description || 'Sin descripción' }}</p>

            <!-- Features list -->
            <ul *ngIf="svc.features && svc.features.length > 0" class="space-y-1 mb-4">
              <li *ngFor="let feat of svc.features.slice(0, 4)" class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <i class="pi pi-check-circle text-green-400 flex-shrink-0"></i>
                <span>{{ feat }}</span>
              </li>
              <li *ngIf="svc.features.length > 4" class="text-xs text-slate-500 dark:text-slate-500 pl-5">
                +{{ svc.features.length - 4 }} más...
              </li>
            </ul>

            <!-- Delivery time -->
            <div *ngIf="svc.deliveryTime" class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
              <i class="pi pi-clock text-blue-400/70"></i>
              <span>Entrega estimada: <strong class="text-slate-700 dark:text-slate-300">{{ svc.deliveryTime }}</strong></span>
            </div>
          </div>

          <!-- Price + Actions Footer -->
          <div class="px-5 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-200/40 dark:bg-white/[0.02] flex items-center justify-between">
            <div>
              <span class="text-xl font-bold text-slate-900 dark:text-white">\${{ svc.price | number:'1.0-0' }}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400 ml-1">{{ priceTypeSuffix(svc.priceType) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <!-- Active toggle -->
              <button
                (click)="toggleActive(svc)"
                class="relative inline-flex items-center w-9 h-[18px] rounded-full transition-all duration-300"
                [ngClass]="svc.isActive !== false ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'"
                [title]="svc.isActive !== false ? 'Desactivar' : 'Activar'">
                <span class="w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-300"
                  [ngClass]="svc.isActive !== false ? 'translate-x-4' : 'translate-x-0.5'"></span>
              </button>
              <button (click)="openEdit(svc)"
                class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 flex items-center justify-center transition-colors"
                title="Editar">
                <i class="pi pi-pencil text-xs"></i>
              </button>
              <button (click)="confirmDelete(svc)"
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
    <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="closeModal()">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div class="relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto" (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ editingSvc ? 'Editar Servicio' : 'Nuevo Servicio' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ editingSvc ? 'Modifica los datos.' : 'Añade un nuevo servicio al catálogo.' }}</p>
          </div>
          <button (click)="closeModal()" class="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 flex items-center justify-center text-slate-500 transition-colors">
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-5">

          <!-- Name -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Nombre del Servicio *</label>
            <input type="text" [(ngModel)]="form.name"
              placeholder="Ej: Página Web Básica / Agente IA Mensual"
              class="w-full bg-white dark:bg-slate-800 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
              [ngClass]="formErrors.name ? 'border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-blue-500/50'">
            <p *ngIf="formErrors.name" class="text-red-400 text-xs mt-1">{{ formErrors.name }}</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Descripción</label>
            <textarea [(ngModel)]="form.description" rows="2"
              placeholder="Breve descripción del servicio..."
              class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 transition-all resize-none"></textarea>
          </div>

          <!-- Category & Price Type -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Categoría *</label>
              <select [(ngModel)]="form.category"
                class="w-full bg-white dark:bg-slate-800 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none transition-all"
                [ngClass]="formErrors.category ? 'border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-blue-500/50'">
                <option value="">Seleccionar...</option>
                <option *ngFor="let cat of CATEGORIES" [value]="cat">{{ cat }}</option>
              </select>
              <p *ngIf="formErrors.category" class="text-red-400 text-xs mt-1">{{ formErrors.category }}</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Tipo de Precio</label>
              <select [(ngModel)]="form.priceType"
                class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-all">
                <option *ngFor="let pt of PRICE_TYPES" [value]="pt.value">{{ pt.label }}</option>
              </select>
            </div>
          </div>

          <!-- Price & Delivery -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Precio * (USD)</label>
              <input type="number" [(ngModel)]="form.price" placeholder="0" min="0" step="0.01"
                class="w-full bg-white dark:bg-slate-800 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
                [ngClass]="formErrors.price ? 'border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-blue-500/50'">
              <p *ngIf="formErrors.price" class="text-red-400 text-xs mt-1">{{ formErrors.price }}</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Tiempo de Entrega</label>
              <input type="text" [(ngModel)]="form.deliveryTime" placeholder="Ej: 2-4 semanas"
                class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 transition-all">
            </div>
          </div>

          <!-- Features -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Características incluidas
              <span class="text-slate-400 normal-case ml-1">(una por línea)</span>
            </label>
            <textarea [(ngModel)]="featuresText" rows="5"
              placeholder="Diseño responsivo&#10;Formulario de contacto&#10;SEO básico&#10;Certificado SSL&#10;1 año de soporte"
              class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 transition-all resize-none font-mono leading-relaxed"></textarea>
            <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">Estas características se muestran como lista de ventajas en la tarjeta del servicio.</p>
          </div>

          <!-- Image URL -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">URL de imagen del servicio</label>
            <input type="url" [(ngModel)]="form.image" placeholder="https://ejemplo.com/imagen.png"
              class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 transition-all">
          </div>

          <!-- Featured toggle -->
          <div class="flex items-center justify-between p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
            <div>
              <p class="text-sm font-semibold text-slate-900 dark:text-white">Servicio Destacado</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Aparece primero y con badge dorado en el catálogo y página de Precios</p>
            </div>
            <button type="button" (click)="form.featured = !form.featured"
              class="relative inline-flex items-center w-12 h-6 rounded-full transition-all duration-300"
              [ngClass]="form.featured ? 'bg-yellow-400' : 'bg-slate-300 dark:bg-slate-700'">
              <span class="w-5 h-5 rounded-full bg-white shadow transition-transform duration-300"
                [ngClass]="form.featured ? 'translate-x-6' : 'translate-x-0.5'"></span>
            </button>
          </div>

          <!-- Error banner -->
          <div *ngIf="saveError()" class="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ saveError() }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex gap-3 p-6 border-t border-slate-200 dark:border-white/5">
          <button (click)="closeModal()"
            class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold transition-colors text-sm">
            Cancelar
          </button>
          <button (click)="saveSvc()" [disabled]="isSaving()"
            class="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200 disabled:opacity-60 text-sm flex items-center justify-center gap-2">
            <i *ngIf="isSaving()" class="pi pi-spin pi-spinner text-sm"></i>
            <i *ngIf="!isSaving()" class="pi pi-check text-sm"></i>
            {{ isSaving() ? 'Guardando...' : (editingSvc ? 'Actualizar' : 'Crear Servicio') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== DELETE MODAL ===== -->
    <div *ngIf="showDeleteModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="showDeleteModal.set(false)">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div class="relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6" (click)="$event.stopPropagation()">
        <div class="text-center mb-6">
          <div class="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-trash text-2xl text-red-400"></i>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Eliminar Servicio</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            ¿Eliminar <span class="font-semibold text-slate-700 dark:text-slate-300">{{ svcToDelete?.name }}</span>? Esta acción no se puede deshacer.
          </p>
        </div>
        <div class="flex gap-3">
          <button (click)="showDeleteModal.set(false)"
            class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold transition-colors text-sm">
            Cancelar
          </button>
          <button (click)="deleteSvc()" [disabled]="isDeleting()"
            class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors text-sm flex items-center justify-center gap-2">
            <i *ngIf="isDeleting()" class="pi pi-spin pi-spinner text-sm"></i>
            {{ isDeleting() ? 'Eliminando...' : 'Sí, Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProductsComponent implements OnInit {
  private productsService = inject(ProductsService);
  protected CATEGORIES = CATEGORIES;
  protected PRICE_TYPES = PRICE_TYPES;

  services = signal<Service[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  showDeleteModal = signal(false);
  isSaving = signal(false);
  isDeleting = signal(false);
  saveError = signal('');

  editingSvc: Service | null = null;
  svcToDelete: Service | null = null;
  categoryFilter = '';
  featuresText = '';  // textarea para features (una por línea)

  form = {
    name: '',
    description: '',
    image: '',
    price: 0,
    category: '',
    priceType: 'unique',
    deliveryTime: '',
    featured: false
  };

  formErrors: { name?: string; price?: string; category?: string } = {};

  ngOnInit() { this.load(); }

  load() {
    this.isLoading.set(true);
    this.productsService.getAll().subscribe({
      next: (res: any) => {
        this.services.set(res.data || res || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  filtered() {
    if (!this.categoryFilter) return this.services();
    return this.services().filter(s => s.category === this.categoryFilter);
  }

  setCategoryFilter(cat: string) { this.categoryFilter = cat; }

  activeCount()       { return this.services().filter(s => s.isActive !== false).length; }
  featuredCount()     { return this.services().filter(s => s.featured).length; }
  subscriptionCount() { return this.services().filter(s => s.priceType === 'monthly' || s.priceType === 'annual').length; }

  priceTypeLabel(type?: string) {
    return PRICE_TYPES.find(p => p.value === type)?.label ?? 'Pago único';
  }

  priceTypeSuffix(type?: string) {
    if (type === 'monthly') return '/ mes';
    if (type === 'annual')  return '/ año';
    return '';
  }

  categoryColor(cat: string) {
    const map: Record<string, string> = {
      'Página Web':       'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Agente IA':        'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Paquete Completo': 'bg-green-500/10 text-green-400 border-green-500/20',
      'Mantenimiento':    'bg-orange-500/10 text-orange-400 border-orange-500/20'
    };
    return map[cat] || 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-white/5';
  }

  categoryIcon(cat: string) {
    const map: Record<string, string> = {
      'Página Web':       'pi pi-desktop',
      'Agente IA':        'pi pi-microchip',
      'Paquete Completo': 'pi pi-box',
      'Mantenimiento':    'pi pi-wrench'
    };
    return map[cat] || 'pi pi-tag';
  }

  openCreate() {
    this.editingSvc = null;
    this.form = { name: '', description: '', image: '', price: 0, category: '', priceType: 'unique', deliveryTime: '', featured: false };
    this.featuresText = '';
    this.formErrors = {};
    this.saveError.set('');
    this.showModal.set(true);
  }

  openEdit(svc: Service) {
    this.editingSvc = svc;
    this.form = {
      name: svc.name,
      description: svc.description || '',
      image: svc.image || '',
      price: svc.price,
      category: svc.category,
      priceType: svc.priceType || 'unique',
      deliveryTime: svc.deliveryTime || '',
      featured: svc.featured || false
    };
    this.featuresText = (svc.features || []).join('\n');
    this.formErrors = {};
    this.saveError.set('');
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); this.editingSvc = null; }

  validate(): boolean {
    this.formErrors = {};
    if (!this.form.name.trim())     this.formErrors.name = 'El nombre es obligatorio.';
    if (this.form.price < 0)        this.formErrors.price = 'El precio no puede ser negativo.';
    if (!this.form.category.trim()) this.formErrors.category = 'La categoría es obligatoria.';
    return Object.keys(this.formErrors).length === 0;
  }

  saveSvc() {
    if (!this.validate()) return;
    this.isSaving.set(true);
    this.saveError.set('');

    const features = this.featuresText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const payload = { ...this.form, features };

    const req = this.editingSvc
      ? this.productsService.update(this.editingSvc.id, payload)
      : this.productsService.create(payload);

    req.subscribe({
      next: () => { this.isSaving.set(false); this.closeModal(); this.load(); },
      error: (err: any) => {
        this.isSaving.set(false);
        this.saveError.set(err?.error?.message || 'Error al guardar el servicio.');
      }
    });
  }

  confirmDelete(svc: Service) { this.svcToDelete = svc; this.showDeleteModal.set(true); }

  deleteSvc() {
    if (!this.svcToDelete) return;
    this.isDeleting.set(true);
    this.productsService.delete(this.svcToDelete.id).subscribe({
      next: () => { this.isDeleting.set(false); this.showDeleteModal.set(false); this.svcToDelete = null; this.load(); },
      error: () => this.isDeleting.set(false)
    });
  }

  toggleActive(svc: Service) {
    this.productsService.update(svc.id, { isActive: !svc.isActive }).subscribe({
      next: () => this.load()
    });
  }
}
