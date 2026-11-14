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

const CATEGORIES = [
  'Páginas Web',
  'Catálogos Digitales',
  'Tiendas Virtuales',
  'Agentes IA',
  'Sistemas Administrativos',
  'Mantenimiento & Soporte'
];

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
    <div class="admin-page">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Servicios y Soluciones</h1>
          <p class="text-xs text-slate-500 mt-0.5">Catálogo de productos comerciales y soluciones tecnológicas que ofrece SAMTS.</p>
        </div>
        <button
          (click)="openCreate()"
          class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm">
          <i class="pi pi-plus text-xs"></i>
          Nuevo Servicio
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Soluciones</p>
          <p class="text-2xl font-bold text-slate-900">{{ services().length }}</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Activos</p>
          <p class="text-2xl font-bold text-emerald-700">{{ activeCount() }}</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p class="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">Destacados</p>
          <p class="text-2xl font-bold text-amber-700">{{ featuredCount() }}</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p class="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">Planes Recurrentes</p>
          <p class="text-2xl font-bold text-blue-700">{{ subscriptionCount() }}</p>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="flex flex-wrap gap-1.5 bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm">
        <button
          (click)="setCategoryFilter('')"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border"
          [ngClass]="categoryFilter === ''
            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'">
          Todos ({{ services().length }})
        </button>
        <button
          *ngFor="let cat of CATEGORIES"
          (click)="setCategoryFilter(cat)"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border"
          [ngClass]="categoryFilter === cat
            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'">
          {{ cat }}
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="py-16 text-center">
        <i class="pi pi-spinner animate-spin text-3xl text-blue-600"></i>
        <p class="text-xs text-slate-400 mt-2">Cargando servicios...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && filtered().length === 0" class="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <i class="pi pi-box text-xl"></i>
        </div>
        <h3 class="text-sm font-bold text-slate-800">No hay servicios en esta categoría</h3>
        <p class="text-xs text-slate-400 mt-1 mb-4">Registra los paquetes comerciales de SAMTS para cotizaciones.</p>
        <button (click)="openCreate()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <i class="pi pi-plus text-xs mr-1"></i>Crear Primer Servicio
        </button>
      </div>

      <!-- Service Cards Grid -->
      <div *ngIf="!isLoading() && filtered().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let svc of filtered()"
          class="relative bg-white border rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between"
          [ngClass]="svc.featured ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'">

          <!-- Card Header & Body -->
          <div class="p-5 relative flex-1">
            <!-- Featured badge -->
            <div *ngIf="svc.featured" class="absolute top-4 right-4">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold">
                <i class="pi pi-star-fill text-[8px]"></i> Destacado
              </span>
            </div>

            <!-- Category & Price Type Badges -->
            <div class="flex items-center gap-1.5 mb-2.5">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold border" [ngClass]="categoryColor(svc.category)">
                <i class="mr-1 text-[9px]" [ngClass]="categoryIcon(svc.category)"></i>{{ svc.category }}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {{ priceTypeLabel(svc.priceType) }}
              </span>
            </div>

            <!-- Title & Description -->
            <h3 class="text-sm font-bold text-slate-900 mb-1 pr-16 truncate">{{ svc.name }}</h3>
            <p class="text-xs text-slate-500 line-clamp-2 mb-3 min-h-[32px]">{{ svc.description || 'Sin descripción detallada.' }}</p>

            <!-- Features -->
            <ul *ngIf="svc.features && svc.features.length > 0" class="space-y-1 mb-3 pt-2 border-t border-slate-100">
              <li *ngFor="let feat of svc.features.slice(0, 3)" class="flex items-center gap-1.5 text-xs text-slate-600">
                <i class="pi pi-check text-emerald-600 text-[10px]"></i>
                <span class="truncate">{{ feat }}</span>
              </li>
              <li *ngIf="svc.features.length > 3" class="text-[10px] text-slate-400 pl-4">
                +{{ svc.features.length - 3 }} características más
              </li>
            </ul>

            <!-- Delivery Time -->
            <div *ngIf="svc.deliveryTime" class="flex items-center gap-1.5 text-[11px] text-slate-400">
              <i class="pi pi-clock text-[10px] text-slate-500"></i>
              <span>Entrega estimada: <strong class="text-slate-700 font-semibold">{{ svc.deliveryTime }}</strong></span>
            </div>
          </div>

          <!-- Price & Footer Actions -->
          <div class="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <span class="text-lg font-bold text-slate-900">\${{ svc.price | number:'1.0-0' }}</span>
              <span class="text-[11px] text-slate-500 ml-1">{{ priceTypeSuffix(svc.priceType) }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                (click)="toggleActive(svc)"
                class="relative inline-flex items-center w-8 h-4.5 rounded-full transition-colors"
                [ngClass]="svc.isActive !== false ? 'bg-emerald-600' : 'bg-slate-300'"
                [title]="svc.isActive !== false ? 'Desactivar' : 'Activar'">
                <span class="w-3.5 h-3.5 rounded-full bg-white shadow transition-transform"
                  [ngClass]="svc.isActive !== false ? 'translate-x-3.5' : 'translate-x-0.5'"></span>
              </button>
              <button (click)="openEdit(svc)"
                class="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 flex items-center justify-center transition-colors text-xs"
                title="Editar">
                <i class="pi pi-pencil"></i>
              </button>
              <button (click)="confirmDelete(svc)"
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
      <div class="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 class="text-base font-bold text-slate-900">{{ editingSvc ? 'Editar Servicio' : 'Nuevo Servicio Comercial' }}</h3>
            <p class="text-xs text-slate-500 mt-0.5">Configura la oferta que se mostrará en cotizaciones y catálogo.</p>
          </div>
          <button (click)="closeModal()" class="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 text-xs">
          <!-- Name -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nombre del Servicio *</label>
            <input type="text" [(ngModel)]="form.name"
              placeholder="Ej: Catálogo Digital con Cotizador Automático"
              class="w-full px-3 py-2 border rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              [ngClass]="formErrors.name ? 'border-red-500' : 'border-slate-200'">
            <p *ngIf="formErrors.name" class="text-rose-600 text-[11px] mt-1">{{ formErrors.name }}</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Descripción</label>
            <textarea [(ngModel)]="form.description" rows="2"
              placeholder="Alcance del servicio y valor que aporta al cliente..."
              class="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 resize-none"></textarea>
          </div>

          <!-- Category & Price Type -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Categoría *</label>
              <select [(ngModel)]="form.category"
                class="w-full px-3 py-2 border rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                [ngClass]="formErrors.category ? 'border-red-500' : 'border-slate-200'">
                <option value="">Seleccionar categoría...</option>
                <option *ngFor="let cat of CATEGORIES" [value]="cat">{{ cat }}</option>
              </select>
              <p *ngIf="formErrors.category" class="text-rose-600 text-[11px] mt-1">{{ formErrors.category }}</p>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Tipo de Facturación</label>
              <select [(ngModel)]="form.priceType"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500">
                <option *ngFor="let pt of PRICE_TYPES" [value]="pt.value">{{ pt.label }}</option>
              </select>
            </div>
          </div>

          <!-- Price & Delivery Time -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Precio Referencial ($ USD/MXN) *</label>
              <input type="number" [(ngModel)]="form.price" placeholder="0" min="0" step="1"
                class="w-full px-3 py-2 border rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                [ngClass]="formErrors.price ? 'border-red-500' : 'border-slate-200'">
              <p *ngIf="formErrors.price" class="text-rose-600 text-[11px] mt-1">{{ formErrors.price }}</p>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Tiempo de Entrega</label>
              <input type="text" [(ngModel)]="form.deliveryTime" placeholder="Ej: 1-2 semanas"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500">
            </div>
          </div>

          <!-- Features -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">
              Características del Servicio
              <span class="text-slate-400 font-normal ml-1">(una por línea)</span>
            </label>
            <textarea [(ngModel)]="featuresText" rows="4"
              placeholder="Diseño responsive móvil y escritorio&#10;Panel de control propio&#10;Sincronización con WhatsApp&#10;Garantía de soporte 60 días"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500 resize-none"></textarea>
          </div>

          <!-- Featured toggle -->
          <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <p class="font-semibold text-slate-800 text-xs">Destacar en Catálogo</p>
              <p class="text-[11px] text-slate-400">Aparecerá en primer orden con distintivo especial.</p>
            </div>
            <button type="button" (click)="form.featured = !form.featured"
              class="relative inline-flex items-center w-10 h-5 rounded-full transition-colors"
              [ngClass]="form.featured ? 'bg-amber-500' : 'bg-slate-300'">
              <span class="w-4 h-4 rounded-full bg-white shadow transition-transform"
                [ngClass]="form.featured ? 'translate-x-5' : 'translate-x-0.5'"></span>
            </button>
          </div>

          <!-- Error banner -->
          <div *ngIf="saveError()" class="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <i class="pi pi-exclamation-circle text-rose-500"></i>
            <span>{{ saveError() }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50">
          <button (click)="closeModal()" class="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-white rounded-lg text-xs font-semibold transition-colors">
            Cancelar
          </button>
          <button (click)="saveSvc()" [disabled]="isSaving()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
            <i *ngIf="isSaving()" class="pi pi-spinner animate-spin text-xs"></i>
            <i *ngIf="!isSaving()" class="pi pi-check text-xs"></i>
            <span>{{ isSaving() ? 'Guardando...' : (editingSvc ? 'Actualizar' : 'Crear Servicio') }}</span>
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
          <h3 class="text-sm font-bold text-slate-900 mb-1">¿Eliminar servicio?</h3>
          <p class="text-xs text-slate-500">
            Se eliminará <strong class="text-slate-800">{{ svcToDelete?.name }}</strong> del catálogo comercial.
          </p>
        </div>
        <div class="flex gap-2">
          <button (click)="showDeleteModal.set(false)" class="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button (click)="deleteSvc()" [disabled]="isDeleting()" class="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
            <i *ngIf="isDeleting()" class="pi pi-spinner animate-spin text-xs"></i>
            <span>Eliminar</span>
          </button>
        </div>
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
  featuresText = '';

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

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.productsService.getAll().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        this.services.set(list);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading services', err);
        this.isLoading.set(false);
      }
    });
  }

  filtered() {
    if (!this.categoryFilter) return this.services();
    return this.services().filter(s => s.category === this.categoryFilter);
  }

  setCategoryFilter(cat: string) {
    this.categoryFilter = cat;
  }

  activeCount() {
    return this.services().filter(s => s.isActive !== false).length;
  }

  featuredCount() {
    return this.services().filter(s => s.featured).length;
  }

  subscriptionCount() {
    return this.services().filter(s => s.priceType === 'monthly' || s.priceType === 'annual').length;
  }

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
      'Páginas Web':              'bg-blue-50 text-blue-700 border-blue-200',
      'Catálogos Digitales':      'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Tiendas Virtuales':        'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Agentes IA':               'bg-purple-50 text-purple-700 border-purple-200',
      'Sistemas Administrativos': 'bg-amber-50 text-amber-700 border-amber-200',
      'Mantenimiento & Soporte':  'bg-slate-50 text-slate-700 border-slate-200'
    };
    return map[cat] || 'bg-slate-50 text-slate-600 border-slate-200';
  }

  categoryIcon(cat: string) {
    const map: Record<string, string> = {
      'Páginas Web':              'pi pi-desktop',
      'Catálogos Digitales':      'pi pi-book',
      'Tiendas Virtuales':        'pi pi-shopping-cart',
      'Agentes IA':               'pi pi-microchip',
      'Sistemas Administrativos': 'pi pi-server',
      'Mantenimiento & Soporte':  'pi pi-wrench'
    };
    return map[cat] || 'pi pi-box';
  }

  openCreate() {
    this.editingSvc = null;
    this.form = {
      name: '',
      description: '',
      image: '',
      price: 0,
      category: 'Páginas Web',
      priceType: 'unique',
      deliveryTime: '2 semanas',
      featured: false
    };
    this.featuresText = 'Diseño responsive adaptado a móviles\nFormulario de contacto conectado a WhatsApp\nOptimización de carga y SEO inicial';
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

  closeModal() {
    this.showModal.set(false);
    this.editingSvc = null;
  }

  validate(): boolean {
    this.formErrors = {};
    if (!this.form.name.trim()) this.formErrors.name = 'El nombre del servicio es obligatorio.';
    if (this.form.price < 0) this.formErrors.price = 'El precio no puede ser negativo.';
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
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
        this.load();
      },
      error: (err: any) => {
        this.isSaving.set(false);
        this.saveError.set(err?.error?.message || 'Error al guardar el servicio en la base de datos.');
      }
    });
  }

  confirmDelete(svc: Service) {
    this.svcToDelete = svc;
    this.showDeleteModal.set(true);
  }

  deleteSvc() {
    if (!this.svcToDelete) return;
    this.isDeleting.set(true);
    this.productsService.delete(this.svcToDelete.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.svcToDelete = null;
        this.load();
      },
      error: () => this.isDeleting.set(false)
    });
  }

  toggleActive(svc: Service) {
    this.productsService.update(svc.id, { isActive: !svc.isActive }).subscribe({
      next: () => this.load(),
      error: (err) => console.error('Error toggling service active status', err)
    });
  }
}
