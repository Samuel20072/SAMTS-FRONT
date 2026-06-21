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
    <div class="p-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Artículos y Páginas Activas</h2>
          <p class="text-sm text-slate-600 dark:text-slate-400">Gestiona y monitoriza el contenido de tus webs.</p>
        </div>
        <button
          (click)="openCreate()"
          class="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95">
          <i class="pi pi-plus text-sm"></i>
          Nueva Página
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex justify-center py-16">
        <div class="flex flex-col items-center gap-3">
          <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
          <p class="text-sm text-slate-500 dark:text-slate-400">Cargando páginas...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && pages().length === 0" class="text-center py-16">
        <div class="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-file-edit text-2xl text-blue-400"></i>
        </div>
        <p class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Sin páginas ni artículos</p>
        <p class="text-sm text-slate-500 dark:text-slate-500 mb-6">Crea tu primer artículo o página web.</p>
        <button (click)="openCreate()" class="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
          <i class="pi pi-plus mr-2"></i>Crear Página
        </button>
      </div>

      <!-- Grid -->
      <div *ngIf="!isLoading() && pages().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let page of pages()"
          class="bg-slate-100 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5 group cursor-pointer">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <div class="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-white/5">
                <i class="pi pi-file-edit text-xl text-blue-400"></i>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                  [ngClass]="page.status === 'PUBLISHED'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'">
                  <span *ngIf="page.status === 'PUBLISHED'" class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  {{ page.status === 'PUBLISHED' ? 'Online' : 'Borrador' }}
                </span>
              </div>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate">{{ page.title }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-500 mb-2 font-mono">/{{ page.slug }}</p>
            <p *ngIf="page.excerpt" class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">{{ page.excerpt }}</p>
          </div>

          <div class="px-6 py-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-200/50 dark:bg-white/[0.02]">
            <div class="flex flex-col">
              <span class="text-xs text-slate-500 dark:text-slate-500">Actualizado</span>
              <span class="font-semibold text-sm text-slate-700 dark:text-slate-300">{{ page.updatedAt | date:'dd/MM/yy' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                (click)="openEdit(page); $event.stopPropagation()"
                class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 flex items-center justify-center transition-colors"
                title="Editar">
                <i class="pi pi-pencil text-xs"></i>
              </button>
              <button
                (click)="confirmDelete(page); $event.stopPropagation()"
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
        class="relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()">

        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ editingPost ? 'Editar Artículo' : 'Nueva Página / Artículo' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ editingPost ? 'Modifica el contenido.' : 'Completa la información del nuevo artículo.' }}</p>
          </div>
          <button (click)="closeModal()" class="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 flex items-center justify-center text-slate-500 transition-colors">
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-4">
          <!-- AI Generation Section (only on create) -->
          <div *ngIf="!editingPost" class="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 mb-4">
            <div class="flex justify-between items-center cursor-pointer" (click)="toggleAiSection()">
              <div class="flex items-center gap-2">
                <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400">
                  <i class="pi pi-sparkles"></i>
                </span>
                <div>
                  <h4 class="text-sm font-bold text-slate-900 dark:text-white">Autogenerar con IA</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Genera el título y contenido del blog usando el asistente IA.</p>
                </div>
              </div>
              <button class="text-blue-500 hover:text-blue-400 text-xs font-semibold flex items-center gap-1">
                {{ showAiForm() ? 'Ocultar' : 'Configurar' }}
                <i class="pi" [ngClass]="showAiForm() ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
              </button>
            </div>

            <div *ngIf="showAiForm()" class="mt-4 pt-4 border-t border-blue-500/10 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Tipo de Negocio</label>
                  <input type="text" [(ngModel)]="aiForm.businessType" placeholder="Ej: Restaurante, Tienda" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Nombre del Negocio</label>
                  <input type="text" [(ngModel)]="aiForm.businessName" placeholder="Ej: Mi Negocio" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Ciudad</label>
                  <input type="text" [(ngModel)]="aiForm.city" placeholder="Ej: Ciudad" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Tono de Voz</label>
                  <select [(ngModel)]="aiForm.tone" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50">
                    <option value="Profesional">Profesional</option>
                    <option value="Casual">Casual</option>
                    <option value="Divertido">Divertido</option>
                    <option value="Informativo">Informativo</option>
                    <option value="Persuasivo">Persuasivo</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Objetivo de Marketing</label>
                <input type="text" [(ngModel)]="aiForm.marketingGoal" placeholder="Ej: Atraer clientes con una oferta especial" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50">
              </div>

              <div class="flex justify-end pt-2">
                <button
                  (click)="generateWithAi()"
                  [disabled]="isGeneratingAi()"
                  class="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95">
                  <i *ngIf="isGeneratingAi()" class="pi pi-spin pi-spinner"></i>
                  <i *ngIf="!isGeneratingAi()" class="pi pi-sparkles"></i>
                  {{ isGeneratingAi() ? 'Generando...' : 'Generar Artículo con IA' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Title -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Título *</label>
            <input
              type="text"
              [(ngModel)]="form.title"
              (ngModelChange)="onTitleChange()"
              placeholder="Ej: Cómo impulsar tus ventas con IA"
              class="w-full bg-white dark:bg-slate-800 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
              [ngClass]="formErrors.title ? 'border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-blue-500/50'">
            <p *ngIf="formErrors.title" class="text-red-400 text-xs mt-1">{{ formErrors.title }}</p>
          </div>

          <!-- Slug -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Slug (URL)</label>
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-500 dark:text-slate-500 flex-shrink-0">/</span>
              <input
                type="text"
                [(ngModel)]="form.slug"
                placeholder="como-impulsar-ventas-con-ia"
                class="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 transition-all font-mono">
            </div>
          </div>

          <!-- Excerpt -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Extracto / Resumen</label>
            <textarea
              [(ngModel)]="form.excerpt"
              rows="2"
              placeholder="Breve descripción para SEO y vistas previas..."
              class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 transition-all resize-none"></textarea>
          </div>

          <!-- Content -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Contenido *</label>
            <textarea
              [(ngModel)]="form.content"
              rows="10"
              placeholder="Escribe el contenido completo del artículo aquí..."
              class="w-full bg-white dark:bg-slate-800 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all resize-y font-mono leading-relaxed"
              [ngClass]="formErrors.content ? 'border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-blue-500/50'"></textarea>
            <p *ngIf="formErrors.content" class="text-red-400 text-xs mt-1">{{ formErrors.content }}</p>
          </div>

          <!-- Author & Status -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Autor</label>
              <input
                type="text"
                [(ngModel)]="form.author"
                placeholder="Nombre del autor"
                class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 transition-all">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Estado</label>
              <select
                [(ngModel)]="form.status"
                class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-all">
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
            </div>
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
            (click)="savePost()"
            [disabled]="isSaving()"
            class="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200 disabled:opacity-60 text-sm flex items-center justify-center gap-2">
            <i *ngIf="isSaving()" class="pi pi-spin pi-spinner text-sm"></i>
            <i *ngIf="!isSaving()" class="pi pi-check text-sm"></i>
            {{ isSaving() ? 'Guardando...' : (editingPost ? 'Actualizar' : 'Publicar') }}
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
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Eliminar Artículo</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            ¿Eliminar <span class="font-semibold text-slate-700 dark:text-slate-300">{{ postToDelete?.title }}</span>? Esta acción no se puede deshacer.
          </p>
        </div>
        <div class="flex gap-3">
          <button
            (click)="showDeleteModal.set(false)"
            class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold transition-colors text-sm">
            Cancelar
          </button>
          <button
            (click)="deletePost()"
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

  // AI Signals
  showAiForm = signal(false);
  isGeneratingAi = signal(false);

  editingPost: BlogPost | null = null;
  postToDelete: BlogPost | null = null;

  form = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED'
  };

  aiForm = {
    businessType: '',
    businessName: '',
    city: '',
    tone: 'Profesional',
    marketingGoal: '',
  };

  formErrors: { title?: string; content?: string } = {};

  ngOnInit() {
    this.loadPages();
    this.loadClientContext();
  }

  loadClientContext() {
    this.clientService.getMe().subscribe({
      next: (client: any) => {
        this.aiForm.businessName = client.businessName || '';
        this.aiForm.businessType = client.businessType || '';
        this.aiForm.city = 'Tu Ciudad';
      }
    });
    this.aiSettingsService.get().subscribe({
      next: (settings: any) => {
        if (settings) {
          this.aiForm.tone = settings.businessTone || 'Profesional';
          this.aiForm.marketingGoal = settings.businessObjective || '';
        }
      }
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
        this.pages.set(res.data || res || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  openCreate() {
    this.editingPost = null;
    this.form = { title: '', slug: '', excerpt: '', content: '', author: '', status: 'DRAFT' };
    this.formErrors = {};
    this.saveError.set('');
    this.showModal.set(true);
    this.showAiForm.set(false);
    this.loadClientContext(); // Refresh context
  }

  openEdit(post: BlogPost) {
    this.editingPost = post;
    this.form = {
      title: post.title,
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      author: post.author || '',
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
      title: this.form.title,
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
        this.saveError.set(err?.error?.message || 'Error al guardar el artículo.');
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
      error: () => { this.isDeleting.set(false); }
    });
  }
}
