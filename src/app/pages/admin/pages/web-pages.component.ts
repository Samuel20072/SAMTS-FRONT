import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogPostsService } from '../../../services/api/blog-posts.service';
import { AiGenerationService } from '../../../services/api/ai-generation.service';
import { ClientsService } from '../../../services/api/clients.service';
import { AiSettingsService } from '../../../services/api/ai-settings.service';

interface BlogPost {
  id: string;
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  author?: string;
  status?: 'PUBLISHED' | 'DRAFT';
  updatedAt?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-web-pages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Contenido & Blog Corporativo</h1>
          <p class="text-xs text-slate-500 mt-0.5">Gestión de artículos y páginas para posicionamiento SEO y conversión comercial de SAMTS.</p>
        </div>
        <button
          (click)="openCreate()"
          class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm">
          <i class="pi pi-plus text-xs"></i>
          Nuevo Artículo
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="py-20 text-center">
        <i class="pi pi-spinner animate-spin text-3xl text-blue-600"></i>
        <p class="text-xs text-slate-400 mt-2">Cargando publicaciones...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && pages().length === 0" class="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <i class="pi pi-file-edit text-xl"></i>
        </div>
        <h3 class="text-sm font-bold text-slate-800">No hay publicaciones registradas</h3>
        <p class="text-xs text-slate-400 mt-1 mb-4">Crea tu primer artículo o genera uno optimizado con IA para impulsar el blog.</p>
        <button (click)="openCreate()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <i class="pi pi-plus text-xs mr-1"></i>Crear Publicación
        </button>
      </div>

      <!-- Grid of Posts -->
      <div *ngIf="!isLoading() && pages().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let page of pages()"
          class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between group">
          
          <div class="p-5">
            <div class="flex justify-between items-start mb-3">
              <span
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border"
                [ngClass]="page.status === 'PUBLISHED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'">
                <span *ngIf="page.status === 'PUBLISHED'" class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {{ page.status === 'PUBLISHED' ? 'Publicado' : 'Borrador' }}
              </span>
              <span class="text-[10px] text-slate-400">
                {{ page.updatedAt | date:'shortDate' }}
              </span>
            </div>

            <h3 class="text-sm font-bold text-slate-900 mb-1 line-clamp-2">{{ page.title }}</h3>
            <p class="text-[11px] text-blue-600 font-mono mb-2 truncate">/blog/{{ page.slug }}</p>
            <p class="text-xs text-slate-500 line-clamp-3 mb-2">{{ page.excerpt || 'Sin extracto especificado.' }}</p>
          </div>

          <!-- Card Footer -->
          <div class="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span class="text-[11px] text-slate-400 truncate max-w-[140px]">{{ page.author || 'Equipo SAMTS' }}</span>
            <div class="flex items-center gap-1.5">
              <button
                (click)="openEdit(page)"
                class="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 flex items-center justify-center transition-colors text-xs"
                title="Editar">
                <i class="pi pi-pencil"></i>
              </button>
              <button
                (click)="confirmDelete(page)"
                class="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-colors text-xs"
                title="Eliminar">
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div
      *ngIf="showModal()"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      (click)="closeModal()">
      <div
        class="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 class="text-base font-bold text-slate-900">{{ editingPost ? 'Editar Artículo' : 'Nuevo Artículo Corporativo' }}</h3>
            <p class="text-xs text-slate-500 mt-0.5">{{ editingPost ? 'Modifica el contenido y estado de publicación.' : 'Escribe o genera con IA un artículo para el blog.' }}</p>
          </div>
          <button (click)="closeModal()" class="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-4 text-xs">
          
          <!-- AI Assistant Banner (only on new) -->
          <div *ngIf="!editingPost" class="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
            <div class="flex justify-between items-center cursor-pointer" (click)="toggleAiSection()">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <i class="pi pi-sparkles text-xs"></i>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900">Generador de Contenido con IA</h4>
                  <p class="text-[11px] text-slate-500">Genera estructura, títulos y redacción SEO automáticamente.</p>
                </div>
              </div>
              <button class="text-blue-700 text-xs font-semibold flex items-center gap-1">
                {{ showAiForm() ? 'Ocultar' : 'Configurar' }}
                <i class="pi" [ngClass]="showAiForm() ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
              </button>
            </div>

            <div *ngIf="showAiForm()" class="mt-4 pt-3 border-t border-blue-100 space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Sector / Especialidad</label>
                  <input type="text" [(ngModel)]="aiForm.businessType" placeholder="Ej: Soluciones tecnológicas, B2B" class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500">
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Nombre Comercial</label>
                  <input type="text" [(ngModel)]="aiForm.businessName" placeholder="SAMTS Soluciones" class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Tono de Redacción</label>
                  <select [(ngModel)]="aiForm.tone" class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500">
                    <option value="Profesional">Profesional y Consultivo</option>
                    <option value="Informativo">Informativo y Pedagógico</option>
                    <option value="Persuasivo">Persuasivo Comercial</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Objetivo de Conversión</label>
                  <input type="text" [(ngModel)]="aiForm.marketingGoal" placeholder="Ej: Demostrar ventajas de catálogos digitales" class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500">
                </div>
              </div>

              <div class="flex justify-end pt-1">
                <button
                  (click)="generateWithAi()"
                  [disabled]="isGeneratingAi()"
                  class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
                  <i *ngIf="isGeneratingAi()" class="pi pi-spinner animate-spin text-xs"></i>
                  <i *ngIf="!isGeneratingAi()" class="pi pi-sparkles text-xs"></i>
                  <span>{{ isGeneratingAi() ? 'Redactando con IA...' : 'Generar Borrador' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Title -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Título del Artículo *</label>
            <input
              type="text"
              [(ngModel)]="form.title"
              (ngModelChange)="onTitleChange()"
              placeholder="Ej: 5 Ventajas de un Catálogo Digital con Cotizador Automático"
              class="w-full px-3 py-2 border rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              [ngClass]="formErrors.title ? 'border-red-500' : 'border-slate-200'">
            <p *ngIf="formErrors.title" class="text-rose-600 text-[11px] mt-1">{{ formErrors.title }}</p>
          </div>

          <!-- Slug -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Ruta Web (Slug)</label>
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400 font-mono text-xs">/blog/</span>
              <input
                type="text"
                [(ngModel)]="form.slug"
                placeholder="5-ventajas-catalogo-digital"
                class="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500">
            </div>
          </div>

          <!-- Excerpt -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Resumen Breve (Extracto)</label>
            <textarea
              [(ngModel)]="form.excerpt"
              rows="2"
              placeholder="Descripción breve para la vista previa y motores de búsqueda..."
              class="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"></textarea>
          </div>

          <!-- Content -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Cuerpo del Artículo *</label>
            <textarea
              [(ngModel)]="form.content"
              rows="9"
              placeholder="Escribe el contenido en formato Markdown o texto enriquecido..."
              class="w-full px-3 py-2 border rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 leading-relaxed"
              [ngClass]="formErrors.content ? 'border-red-500' : 'border-slate-200'"></textarea>
            <p *ngIf="formErrors.content" class="text-rose-600 text-[11px] mt-1">{{ formErrors.content }}</p>
          </div>

          <!-- Author & Status -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Autor</label>
              <input
                type="text"
                [(ngModel)]="form.author"
                placeholder="Equipo SAMTS"
                class="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Estado de Publicación</label>
              <select
                [(ngModel)]="form.status"
                class="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500">
                <option value="DRAFT">Borrador (Oculto)</option>
                <option value="PUBLISHED">Publicado (Visible en blog)</option>
              </select>
            </div>
          </div>

          <!-- Error Banner -->
          <div *ngIf="saveError()" class="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <i class="pi pi-exclamation-circle text-rose-500"></i>
            <span>{{ saveError() }}</span>
          </div>

        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50">
          <button
            (click)="closeModal()"
            class="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-white rounded-lg text-xs font-semibold transition-colors">
            Cancelar
          </button>
          <button
            (click)="savePost()"
            [disabled]="isSaving()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
            <i *ngIf="isSaving()" class="pi pi-spinner animate-spin text-xs"></i>
            <i *ngIf="!isSaving()" class="pi pi-check text-xs"></i>
            <span>{{ isSaving() ? 'Guardando...' : (editingPost ? 'Guardar Cambios' : 'Publicar Artículo') }}</span>
          </button>
        </div>

      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      *ngIf="showDeleteModal()"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      (click)="showDeleteModal.set(false)">
      <div class="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm p-5" (click)="$event.stopPropagation()">
        <div class="text-center mb-4">
          <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <i class="pi pi-trash text-xl"></i>
          </div>
          <h3 class="text-sm font-bold text-slate-900 mb-1">¿Eliminar artículo?</h3>
          <p class="text-xs text-slate-500">
            Se eliminará <strong class="text-slate-800">{{ postToDelete?.title }}</strong> de forma permanente.
          </p>
        </div>
        <div class="flex gap-2">
          <button
            (click)="showDeleteModal.set(false)"
            class="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            (click)="deletePost()"
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
export class WebPagesComponent implements OnInit {
  private blogPostsService = inject(BlogPostsService);
  private aiGenerationService = inject(AiGenerationService);
  private clientService = inject(ClientsService);
  private aiSettingsService = inject(AiSettingsService);

  pages = signal<BlogPost[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  showDeleteModal = signal(false);
  isSaving = signal(false);
  isDeleting = signal(false);
  saveError = signal('');

  showAiForm = signal(false);
  isGeneratingAi = signal(false);

  editingPost: BlogPost | null = null;
  postToDelete: BlogPost | null = null;

  form = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'Equipo SAMTS',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED'
  };

  aiForm = {
    businessType: 'Soluciones Tecnológicas',
    businessName: 'SAMTS',
    city: 'México',
    tone: 'Profesional',
    marketingGoal: 'Impulsar el crecimiento comercial con catálogos digitales y tiendas',
  };

  formErrors: { title?: string; content?: string } = {};

  ngOnInit() {
    this.loadPages();
    this.loadClientContext();
  }

  loadClientContext() {
    this.clientService.getMe().subscribe({
      next: (client: any) => {
        if (client?.businessName) this.aiForm.businessName = client.businessName;
        if (client?.businessType) this.aiForm.businessType = client.businessType;
      },
      error: () => {}
    });
    this.aiSettingsService.get().subscribe({
      next: (settings: any) => {
        if (settings) {
          this.aiForm.tone = settings.businessTone || 'Profesional';
          this.aiForm.marketingGoal = settings.businessObjective || 'Captación de clientes B2B';
        }
      },
      error: () => {}
    });
  }

  toggleAiSection() {
    this.showAiForm.update((v) => !v);
  }

  generateWithAi() {
    this.isGeneratingAi.set(true);
    this.saveError.set('');
    this.aiGenerationService.generateBlog(this.aiForm).subscribe({
      next: (res: any) => {
        this.isGeneratingAi.set(false);
        this.form.title = res.title;
        this.form.content = res.content;
        this.form.excerpt = res.excerpt || 'Artículo especializado publicado por el equipo de SAMTS.';
        this.onTitleChange();
        this.showAiForm.set(false);
      },
      error: (err: any) => {
        this.isGeneratingAi.set(false);
        this.saveError.set('Error al generar con IA: ' + (err?.error?.message || 'Error desconocido.'));
      }
    });
  }

  loadPages() {
    this.isLoading.set(true);
    this.blogPostsService.getAll().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        this.pages.set(list);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading blog posts', err);
        this.isLoading.set(false);
      }
    });
  }

  openCreate() {
    this.editingPost = null;
    this.form = {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: 'Equipo SAMTS',
      status: 'DRAFT'
    };
    this.formErrors = {};
    this.saveError.set('');
    this.showModal.set(true);
    this.showAiForm.set(false);
    this.loadClientContext();
  }

  openEdit(post: BlogPost) {
    this.editingPost = post;
    this.form = {
      title: post.title,
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      author: post.author || 'Equipo SAMTS',
      status: post.status || 'DRAFT'
    };
    this.formErrors = {};
    this.saveError.set('');
    this.showModal.set(true);
    this.showAiForm.set(false);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingPost = null;
  }

  onTitleChange() {
    if (!this.editingPost) {
      this.form.slug = this.form.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    }
  }

  validateForm(): boolean {
    this.formErrors = {};
    if (!this.form.title.trim()) this.formErrors.title = 'El título es obligatorio.';
    if (!this.form.content.trim()) this.formErrors.content = 'El contenido es obligatorio.';
    return Object.keys(this.formErrors).length === 0;
  }

  savePost() {
    if (!this.validateForm()) return;
    this.isSaving.set(true);
    this.saveError.set('');

    const payload = {
      title: this.form.title.trim(),
      slug: this.form.slug?.trim() || undefined,
      excerpt: this.form.excerpt?.trim() || undefined,
      content: this.form.content,
      status: this.form.status
    };

    const req = this.editingPost
      ? this.blogPostsService.update(this.editingPost.id, payload)
      : this.blogPostsService.create(payload);

    req.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
        this.loadPages();
      },
      error: (err: any) => {
        this.isSaving.set(false);
        this.saveError.set(err?.error?.message || 'Error al guardar el artículo en la base de datos.');
      }
    });
  }

  confirmDelete(post: BlogPost) {
    this.postToDelete = post;
    this.showDeleteModal.set(true);
  }

  deletePost() {
    if (!this.postToDelete) return;
    this.isDeleting.set(true);
    this.blogPostsService.delete(this.postToDelete.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.postToDelete = null;
        this.loadPages();
      },
      error: () => {
        this.isDeleting.set(false);
      }
    });
  }
}
