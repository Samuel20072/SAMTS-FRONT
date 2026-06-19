import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiSettingsService } from '../../../services/api/ai-settings.service';
import { AuthService } from '../../../services/api/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8">
      <h2 class="text-2xl font-display font-bold text-slate-900 dark:text-white mb-8">Configuración del Sistema</h2>
      
      <div class="max-w-4xl bg-slate-100 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        
        <div class="p-6 border-b border-slate-200 dark:border-white/5 flex items-center gap-6">
          <div class="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-white/10 overflow-hidden">
            <img [src]="'https://ui-avatars.com/api/?name=' + (user()?.name || 'Admin') + '&background=0D8ABC&color=fff'" alt="Admin" class="w-full h-full object-cover">
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ user()?.name || 'Administrador Principal' }}</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ user()?.email || 'admin@samts.com' }}</p>
            <span class="mt-2 inline-block text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-semibold">
              Admin General
            </span>
          </div>
        </div>

        <div class="p-6 space-y-8" *ngIf="!isLoading()">
          
          <!-- IA Settings Group -->
          <div>
            <div class="flex items-center justify-between mb-6">
              <div>
                <h4 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Parámetros de Inteligencia Artificial</h4>
                <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Configura el tono y objetivo con el que operan los agentes de IA.</p>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">Estado de IA:</span>
                <button 
                  (click)="aiSettings.isActive = !aiSettings.isActive"
                  [ngClass]="aiSettings.isActive ? 'bg-green-600' : 'bg-slate-700'"
                  class="w-12 h-6 rounded-full p-0.5 transition-colors relative focus:outline-none">
                  <div 
                    [ngClass]="aiSettings.isActive ? 'translate-x-6' : 'translate-x-0'"
                    class="w-5 h-5 bg-white rounded-full shadow transition-transform"></div>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">Tono del Negocio</label>
                <select [(ngModel)]="aiSettings.businessTone" class="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white focus:border-blue-500/50 outline-none text-sm">
                  <option value="Professional">Profesional</option>
                  <option value="Casual">Informal / Casual</option>
                  <option value="Empathetic">Empático / Cercano</option>
                  <option value="Persuasive">Persuasivo</option>
                  <option value="Informative">Informativo</option>
                </select>
              </div>

              <div>
                <label class="block text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">Frecuencia de Publicación</label>
                <select [(ngModel)]="aiSettings.postingFrequency" class="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white focus:border-blue-500/50 outline-none text-sm">
                  <option value="DAILY">Diario</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="MONTHLY">Mensual</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="block text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">Público Objetivo</label>
                <input type="text" [(ngModel)]="aiSettings.targetAudience" class="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white focus:border-blue-500/50 outline-none text-sm">
              </div>

              <div class="md:col-span-2">
                <label class="block text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">Objetivo Comercial Principal</label>
                <input type="text" [(ngModel)]="aiSettings.businessObjective" class="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white focus:border-blue-500/50 outline-none text-sm">
              </div>

              <div class="md:col-span-2">
                <label class="block text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">Palabras Clave (separadas por comas)</label>
                <textarea rows="2" [(ngModel)]="aiSettings.keywords" placeholder="ej: tecnología, inteligencia artificial, automatización" class="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white focus:border-blue-500/50 outline-none text-sm"></textarea>
              </div>
            </div>
          </div>

          <hr class="border-slate-200 dark:border-white/5">

          <!-- IA Automations Group -->
          <div>
            <h4 class="text-sm font-semibold text-slate-900 dark:text-white mb-6 uppercase tracking-wider">Automatizaciones de IA</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Auto Generate Blogs -->
              <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 rounded-xl">
                <div>
                  <h5 class="text-sm font-semibold text-slate-900 dark:text-white">Autogenerar Blogs</h5>
                  <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Crear posts del blog automáticamente.</p>
                </div>
                <button 
                  (click)="aiSettings.autoGenerateBlogs = !aiSettings.autoGenerateBlogs"
                  [ngClass]="aiSettings.autoGenerateBlogs ? 'bg-blue-600' : 'bg-slate-700'"
                  class="w-12 h-6 rounded-full p-0.5 transition-colors relative focus:outline-none">
                  <div 
                    [ngClass]="aiSettings.autoGenerateBlogs ? 'translate-x-6' : 'translate-x-0'"
                    class="w-5 h-5 bg-white rounded-full shadow transition-transform"></div>
                </button>
              </div>

              <!-- Auto Generate Promotions -->
              <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 rounded-xl">
                <div>
                  <h5 class="text-sm font-semibold text-slate-900 dark:text-white">Autogenerar Promociones</h5>
                  <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Generar campañas promocionales automáticas.</p>
                </div>
                <button 
                  (click)="aiSettings.autoGeneratePromotions = !aiSettings.autoGeneratePromotions"
                  [ngClass]="aiSettings.autoGeneratePromotions ? 'bg-blue-600' : 'bg-slate-700'"
                  class="w-12 h-6 rounded-full p-0.5 transition-colors relative focus:outline-none">
                  <div 
                    [ngClass]="aiSettings.autoGeneratePromotions ? 'translate-x-6' : 'translate-x-0'"
                    class="w-5 h-5 bg-white rounded-full shadow transition-transform"></div>
                </button>
              </div>

              <!-- Auto Generate SEO -->
              <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 rounded-xl">
                <div>
                  <h5 class="text-sm font-semibold text-slate-900 dark:text-white">Autogenerar SEO</h5>
                  <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Optimización de metatags y palabras clave.</p>
                </div>
                <button 
                  (click)="aiSettings.autoGenerateSeo = !aiSettings.autoGenerateSeo"
                  [ngClass]="aiSettings.autoGenerateSeo ? 'bg-blue-600' : 'bg-slate-700'"
                  class="w-12 h-6 rounded-full p-0.5 transition-colors relative focus:outline-none">
                  <div 
                    [ngClass]="aiSettings.autoGenerateSeo ? 'translate-x-6' : 'translate-x-0'"
                    class="w-5 h-5 bg-white rounded-full shadow transition-transform"></div>
                </button>
              </div>

              <!-- Auto Generate WhatsApp -->
              <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 rounded-xl">
                <div>
                  <h5 class="text-sm font-semibold text-slate-900 dark:text-white">Respuestas en WhatsApp</h5>
                  <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Enviar mensajes y atender ventas por WhatsApp.</p>
                </div>
                <button 
                  (click)="aiSettings.autoGenerateWhatsappMessages = !aiSettings.autoGenerateWhatsappMessages"
                  [ngClass]="aiSettings.autoGenerateWhatsappMessages ? 'bg-blue-600' : 'bg-slate-700'"
                  class="w-12 h-6 rounded-full p-0.5 transition-colors relative focus:outline-none">
                  <div 
                    [ngClass]="aiSettings.autoGenerateWhatsappMessages ? 'translate-x-6' : 'translate-x-0'"
                    class="w-5 h-5 bg-white rounded-full shadow transition-transform"></div>
                </button>
              </div>
            </div>
          </div>
          
        </div>

        <div *ngIf="isLoading()" class="p-12 flex justify-center">
           <i class="pi pi-spin pi-spinner text-3xl text-blue-500"></i>
        </div>
        
        <div class="p-4 bg-slate-200 dark:bg-slate-800/50 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3">
          <button (click)="resetSettings()" class="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Restablecer</button>
          <button (click)="saveSettings()" [disabled]="isSaving()" class="bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2">
             <i class="pi pi-spin pi-spinner" *ngIf="isSaving()"></i> <i class="pi pi-save" *ngIf="!isSaving()"></i> Guardar Cambios
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
  
  aiSettings: any = {
    businessTone: 'Professional',
    targetAudience: 'General Public',
    businessObjective: 'Brand Awareness',
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
    this.ngOnInit();
  }

  saveSettings() {
    this.isSaving.set(true);
    this.aiSettingsService.update(this.aiSettings).subscribe({
      next: (res: any) => {
        this.isSaving.set(false);
        alert('Configuración guardada correctamente.');
      },
      error: (err: any) => {
        console.error('Error updating settings', err);
        this.isSaving.set(false);
        alert('Error al guardar la configuración.');
      }
    });
  }
}
