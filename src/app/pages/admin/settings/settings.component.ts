import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiSettingsService } from '../../../services/api/ai-settings.service';
import { AuthService } from '../../../services/api/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Configuración del Sistema</h1>
          <p class="text-xs text-slate-500 mt-0.5">Parámetros globales de la plataforma comercial y reglas de automatización IA.</p>
        </div>
      </div>

      <!-- Settings Card -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        <!-- User Profile Banner -->
        <div class="p-5 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-base flex-shrink-0">
            AD
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">{{ user()?.name || 'Administrador Principal SAMTS' }}</h3>
            <p class="text-xs text-slate-500">{{ user()?.email || 'admin@samts.app' }}</p>
            <span class="mt-1 inline-block text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
              Super Admin Global
            </span>
          </div>
        </div>

        <!-- Settings Form -->
        <div class="p-6 space-y-6" *ngIf="!isLoading()">
          
          <!-- IA Settings Group -->
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Parámetros de Inteligencia Artificial</h4>
                <p class="text-[11px] text-slate-500">Define la personalidad comercial y objetivos con los que redactan los agentes.</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-slate-700">Estado de IA:</span>
                <button 
                  (click)="aiSettings.isActive = !aiSettings.isActive"
                  [ngClass]="aiSettings.isActive ? 'bg-emerald-600' : 'bg-slate-300'"
                  class="w-10 h-5 rounded-full p-0.5 transition-colors relative focus:outline-none">
                  <div 
                    [ngClass]="aiSettings.isActive ? 'translate-x-5' : 'translate-x-0'"
                    class="w-4 h-4 bg-white rounded-full shadow transition-transform"></div>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Tono de Comunicación</label>
                <select [(ngModel)]="aiSettings.businessTone" class="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 focus:border-blue-500 focus:outline-none">
                  <option value="Professional">Profesional y Consultivo</option>
                  <option value="Casual">Cercano y Dinámico</option>
                  <option value="Persuasive">Persuasivo de Cierre</option>
                  <option value="Informative">Informativo y Técnico</option>
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Frecuencia de Publicación de Blog</label>
                <select [(ngModel)]="aiSettings.postingFrequency" class="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 focus:border-blue-500 focus:outline-none">
                  <option value="DAILY">Diaria</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="MONTHLY">Mensual</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="block font-semibold text-slate-700 mb-1">Público Objetivo Principal</label>
                <input type="text" [(ngModel)]="aiSettings.targetAudience" placeholder="Ej: Pymes, distribuidores mayoristas, marcas que buscan digitalizarse" class="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 focus:border-blue-500 focus:outline-none">
              </div>

              <div class="md:col-span-2">
                <label class="block font-semibold text-slate-700 mb-1">Objetivo Comercial Primario</label>
                <input type="text" [(ngModel)]="aiSettings.businessObjective" placeholder="Ej: Agendar llamadas demostrativas y cotizar catálogos digitales" class="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 focus:border-blue-500 focus:outline-none">
              </div>

              <div class="md:col-span-2">
                <label class="block font-semibold text-slate-700 mb-1">Palabras Clave de Marca (separadas por comas)</label>
                <textarea rows="2" [(ngModel)]="aiSettings.keywords" placeholder="desarrollo web, catalogos digitales, tiendas en linea, agentes ia, automatizacion de ventas" class="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 focus:border-blue-500 focus:outline-none resize-none"></textarea>
              </div>
            </div>
          </div>

          <!-- IA Automations Group -->
          <div class="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Permisos de Automatización</h4>
              <p class="text-[11px] text-slate-500">Controla qué acciones pueden ejecutar los agentes sin intervención manual previa.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <!-- Auto Generate Blogs -->
              <div class="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <h5 class="text-xs font-bold text-slate-800">Generación de Artículos</h5>
                  <p class="text-[11px] text-slate-500">Crear borradores de contenido SEO.</p>
                </div>
                <button 
                  (click)="aiSettings.autoGenerateBlogs = !aiSettings.autoGenerateBlogs"
                  [ngClass]="aiSettings.autoGenerateBlogs ? 'bg-blue-600' : 'bg-slate-300'"
                  class="w-9 h-5 rounded-full p-0.5 transition-colors relative focus:outline-none">
                  <div 
                    [ngClass]="aiSettings.autoGenerateBlogs ? 'translate-x-4' : 'translate-x-0'"
                    class="w-4 h-4 bg-white rounded-full shadow transition-transform"></div>
                </button>
              </div>

              <!-- Auto Generate WhatsApp -->
              <div class="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <h5 class="text-xs font-bold text-slate-800">Mensajes de WhatsApp</h5>
                  <p class="text-[11px] text-slate-500">Redactar plantillas de seguimiento.</p>
                </div>
                <button 
                  (click)="aiSettings.autoGenerateWhatsappMessages = !aiSettings.autoGenerateWhatsappMessages"
                  [ngClass]="aiSettings.autoGenerateWhatsappMessages ? 'bg-blue-600' : 'bg-slate-300'"
                  class="w-9 h-5 rounded-full p-0.5 transition-colors relative focus:outline-none">
                  <div 
                    [ngClass]="aiSettings.autoGenerateWhatsappMessages ? 'translate-x-4' : 'translate-x-0'"
                    class="w-4 h-4 bg-white rounded-full shadow transition-transform"></div>
                </button>
              </div>
            </div>
          </div>

          <!-- Success / Error notification -->
          <div *ngIf="savedMessage()" class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
            <i class="pi pi-check-circle text-emerald-600"></i>
            <span>{{ savedMessage() }}</span>
          </div>

        </div>

        <!-- Loading spinner -->
        <div *ngIf="isLoading()" class="p-16 text-center">
          <i class="pi pi-spinner animate-spin text-3xl text-blue-600"></i>
          <p class="text-xs text-slate-400 mt-2">Cargando configuración...</p>
        </div>
        
        <!-- Footer Actions -->
        <div class="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button (click)="resetSettings()" class="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-white rounded-lg text-xs font-semibold transition-colors">
            Restablecer
          </button>
          <button (click)="saveSettings()" [disabled]="isSaving()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
            <i class="pi pi-spinner animate-spin text-xs" *ngIf="isSaving()"></i>
            <i class="pi pi-save text-xs" *ngIf="!isSaving()"></i>
            <span>{{ isSaving() ? 'Guardando...' : 'Guardar Cambios' }}</span>
          </button>
        </div>

      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private aiSettingsService: AiSettingsService = inject(AiSettingsService);
  private authService: AuthService = inject(AuthService);
  
  user = signal<any>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  savedMessage = signal('');
  
  aiSettings: any = {
    businessTone: 'Professional',
    targetAudience: 'Pymes y distribuidores',
    businessObjective: 'Adquirir clientes B2B para desarrollo web y software',
    keywords: '',
    postingFrequency: 'WEEKLY',
    autoGenerateBlogs: false,
    autoGeneratePromotions: false,
    autoGenerateSeo: false,
    autoGenerateWhatsappMessages: false,
    isActive: true
  };

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.user.set(this.authService.getCurrentUser());
      
      this.aiSettingsService.get().subscribe({
        next: (res: any) => {
          if (res) {
            this.aiSettings = { ...this.aiSettings, ...res };
          }
          this.isLoading.set(false);
        },
        error: (err: any) => {
          console.error('Error fetching AI settings', err);
          this.isLoading.set(false);
        }
      });
    }
  }

  resetSettings() {
    this.isLoading.set(true);
    this.savedMessage.set('');
    this.ngOnInit();
  }

  saveSettings() {
    this.isSaving.set(true);
    this.savedMessage.set('');
    this.aiSettingsService.update(this.aiSettings).subscribe({
      next: (res: any) => {
        this.isSaving.set(false);
        this.savedMessage.set('Configuración guardada exitosamente en la base de datos.');
        setTimeout(() => this.savedMessage.set(''), 4000);
      },
      error: (err: any) => {
        console.error('Error updating settings', err);
        this.isSaving.set(false);
      }
    });
  }
}
