import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h2 class="text-2xl font-display font-bold text-slate-900 dark:text-white mb-8">Configuración del Sistema</h2>
      
      <div class="max-w-3xl bg-slate-100 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
        
        <div class="p-6 border-b border-slate-200 dark:border-white/5 flex items-center gap-6">
          <div class="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-white/10 overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Admin" class="w-full h-full object-cover">
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Administrador Principal</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">admin@samts.com</p>
            <button class="mt-2 text-xs text-blue-400 border border-blue-400/30 px-3 py-1 rounded hover:bg-blue-400/10 transition-colors">
              Cambiar Avatar
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          
          <div>
            <h4 class="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Preferencias de Notificaciones</h4>
            <div class="space-y-3">
              <label class="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm cursor-pointer hover:text-slate-900 dark:text-white transition-colors">
                <input type="checkbox" checked class="rounded border-slate-700 bg-slate-200 dark:bg-slate-800 text-blue-500 focus:ring-blue-500/50">
                Nuevos leads registrados por IA
              </label>
              <label class="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm cursor-pointer hover:text-slate-900 dark:text-white transition-colors">
                <input type="checkbox" checked class="rounded border-slate-700 bg-slate-200 dark:bg-slate-800 text-blue-500 focus:ring-blue-500/50">
                Alertas de rendimiento de páginas web
              </label>
              <label class="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm cursor-pointer hover:text-slate-900 dark:text-white transition-colors">
                <input type="checkbox" class="rounded border-slate-700 bg-slate-200 dark:bg-slate-800 text-blue-500 focus:ring-blue-500/50">
                Reportes semanales de conversión
              </label>
            </div>
          </div>

          <div class="pt-6 border-t border-slate-200 dark:border-white/5">
            <h4 class="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Tokens de API y Conexiones</h4>
            <div class="space-y-4">
              <div>
                <label class="block text-xs text-slate-600 dark:text-slate-400 mb-1">OpenAI API Key</label>
                <input type="password" value="sk-1234567890abcdef" class="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-white/10 rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:border-blue-500/50 outline-none font-mono text-sm">
              </div>
              <div>
                <label class="block text-xs text-slate-600 dark:text-slate-400 mb-1">Stripe / Wompi Webhook Secret</label>
                <input type="password" value="whsec_123456" class="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-white/10 rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:border-blue-500/50 outline-none font-mono text-sm">
              </div>
            </div>
          </div>
          
        </div>
        
        <div class="p-4 bg-slate-200 dark:bg-slate-800/50 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3">
          <button class="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
          <button class="bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">Guardar Cambios</button>
        </div>

      </div>
    </div>
  `
})
export class SettingsComponent {}
