import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemoConfigService, DemoConfig, NicheConfig } from '../../services/demo-config.service';

type NicheKey = keyof DemoConfig['niches'];

interface NicheMeta {
  id: NicheKey;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-demo-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './demo-editor.component.html',
  styleUrls: ['./demo-editor.component.scss'],
})
export class DemoEditorComponent {
  demoConfig = inject(DemoConfigService);

  readonly cfg = this.demoConfig.config;
  isOpen = signal(false);
  showSaved = signal(false);

  readonly activeProductIndexes = computed<number[]>(() => {
    const list = this.activeCfg()?.productImages || [];
    const count = Math.max(list.length, 6);
    return Array.from({ length: Math.min(count, 8) }, (_, i) => i);
  });

  readonly nicheMetas: NicheMeta[] = [
    { id: 'boutique', label: 'Ropa & Moda', icon: 'pi-tag' },
    { id: 'restaurant', label: 'Restaurante', icon: 'pi-apple' },
    { id: 'barbershop', label: 'Barbería', icon: 'pi-star' },
    { id: 'products', label: 'Tienda Tech', icon: 'pi-box' },
    { id: 'services', label: 'Servicios', icon: 'pi-briefcase' },
  ];

  /** Active niche being edited — synced with demo section active niche */
  readonly activeEditorNiche = computed<NicheKey>(
    () => (this.cfg().activeNicheId as NicheKey) || 'boutique'
  );

  readonly isBoutique = computed(() => this.activeEditorNiche() === 'boutique');
  readonly isServices = computed(() => this.activeEditorNiche() === 'services');
  readonly isRestaurant = computed(() => this.activeEditorNiche() === 'restaurant');

  getProductLabel(index: number): string {
    const niche = this.activeEditorNiche();
    if (niche === 'services') return `Servicio ${index + 1}`;
    if (niche === 'restaurant') return `Plato ${index + 1}`;
    if (niche === 'barbershop') return `Servicio ${index + 1}`;
    return `Producto ${index + 1}`;
  }

  /** Returns the NicheConfig for the currently active niche */
  readonly activeCfg = computed<NicheConfig>(() => {
    const key = this.activeEditorNiche();
    return this.cfg().niches[key];
  });

  togglePanel(): void {
    this.isOpen.update((v) => !v);
  }

  switchEditorNiche(key: NicheKey): void {
    this.demoConfig.setActiveNicheId(key);
  }

  // ── Boutique layout ──────────────────────────────────────────────────────────
  onLayoutChange(layout: 'layout1' | 'layout2'): void {
    this.demoConfig.update({ boutiqueLayout: layout });
    this.flashSaved();
  }

  // ── Niche text / color ────────────────────────────────────────────────────────
  onNicheTextChange(field: 'businessTitle' | 'tagline', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const key = this.activeEditorNiche();
    this.demoConfig.updateNiche(key, { [field]: value });
    if (key === 'boutique') {
      const legacy = field === 'businessTitle'
        ? { boutiqueBusinessTitle: value }
        : { boutiqueTagline: value };
      this.demoConfig.update(legacy as Partial<DemoConfig>);
    }
    this.flashSaved();
  }

  onNicheColorChange(field: 'primaryColor' | 'accentColor' | 'bgColor', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const key = this.activeEditorNiche();
    this.demoConfig.updateNiche(key, { [field]: value });
    if (key === 'boutique') {
      const legacyMap: Record<string, keyof DemoConfig> = {
        primaryColor: 'boutiquePrimaryColor',
        accentColor: 'boutiqueAccentColor',
        bgColor: 'boutiqueBgColor',
      };
      const legacyKey = legacyMap[field];
      if (legacyKey) this.demoConfig.update({ [legacyKey]: value } as Partial<DemoConfig>);
    }
    this.flashSaved();
  }

  onNicheHeroChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const key = this.activeEditorNiche();
    this.demoConfig.replaceNicheImageFromFile(key, 'heroImage', file);
    if (key === 'boutique') this.demoConfig.replaceImageFromFile('boutiqueHeroImage', file);
    this.flashSaved();
  }

  onNicheProductImageChange(index: number, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const key = this.activeEditorNiche();
    this.demoConfig.replaceNicheImageFromFile(key, index, file);
    if (key === 'boutique') {
      const legacyKey = `boutiqueProduct${index + 1}` as keyof DemoConfig;
      this.demoConfig.replaceImageFromFile(legacyKey, file);
    }
    this.flashSaved();
  }

  getNicheProductImage(index: number): string {
    return this.activeCfg().productImages?.[index] || '';
  }

  onColorChange(key: keyof DemoConfig, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.demoConfig.update({ [key]: value });
    this.flashSaved();
  }

  // ── Boutique-only legacy fields (logos, banners) ──────────────────────────────
  onImageChange(key: keyof DemoConfig, event: Event): void {

    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.demoConfig.replaceImageFromFile(key, file);
    this.flashSaved();
  }

  applyPreset(preset: 'nude' | 'dark' | 'rose' | 'clean'): void {
    const presets: Record<string, Partial<NicheConfig>> = {
      nude: { primaryColor: '#1e1b19', accentColor: '#c5a882', bgColor: '#ffffff' },
      dark: { primaryColor: '#c99b53', accentColor: '#e5a852', bgColor: '#0a0a0c' },
      rose: { primaryColor: '#4a2e35', accentColor: '#d48c9c', bgColor: '#fff8f9' },
      clean: { primaryColor: '#0f172a', accentColor: '#38bdf8', bgColor: '#f8fafc' },
    };
    const p = presets[preset];
    const key = this.activeEditorNiche();
    this.demoConfig.updateNiche(key, p);

    if (key === 'boutique') {
      this.demoConfig.update({
        boutiquePrimaryColor: p.primaryColor,
        boutiqueAccentColor: p.accentColor,
        boutiqueBgColor: p.bgColor,
        boutiqueFooterBgColor: preset === 'dark' ? '#0a0a0a' : preset === 'rose' ? '#4a2e35' : preset === 'clean' ? '#0f172a' : '#c4b4a1',
        boutiqueButtonBgColor: preset === 'dark' ? '#e2b857' : preset === 'rose' ? '#d48c9c' : p.primaryColor,
        boutiqueButtonTextColor: preset === 'dark' ? '#121212' : '#ffffff',
      });
    }
    this.flashSaved();
  }

  onReset(): void {
    if (confirm('¿Restablecer todas las imágenes y configuración al estado original?')) {
      this.demoConfig.reset();
    }
  }

  private flashSaved(): void {
    this.showSaved.set(true);
    setTimeout(() => this.showSaved.set(false), 2000);
  }
}
