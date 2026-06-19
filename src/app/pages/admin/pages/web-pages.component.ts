import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogPostsService } from '../../../services/api/blog-posts.service';

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

  pages = signal<BlogPost[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  showDeleteModal = signal(false);
  isSaving = signal(false);
  isDeleting = signal(false);
  saveError = signal('');

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

  formErrors: { title?: string; content?: string } = {};

  ngOnInit() {
    this.loadPages();
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

    const payload = { ...this.form };
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
