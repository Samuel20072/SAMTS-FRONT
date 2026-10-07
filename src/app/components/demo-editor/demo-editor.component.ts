import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoConfigService, DemoConfig } from '../../services/demo-config.service';

@Component({
  selector: 'app-demo-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demo-editor.component.html',
  styleUrls: ['./demo-editor.component.scss'],
})
export class DemoEditorComponent {
  demoConfig = inject(DemoConfigService);

  readonly cfg = this.demoConfig.config;
  isOpen = signal(false);
  showSaved = signal(false);

  readonly productIndexes = [1, 2, 3, 4, 5, 6, 7, 8];

  togglePanel(): void {
    this.isOpen.update((v) => !v);
  }

  onLayoutChange(layout: 'layout1' | 'layout2'): void {
    this.demoConfig.update({ boutiqueLayout: layout });
    this.flashSaved();
  }

  onTextChange(key: keyof DemoConfig, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.demoConfig.update({ [key]: value } as Partial<DemoConfig>);
    this.flashSaved();
  }

  onColorChange(key: keyof DemoConfig, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.demoConfig.update({ [key]: value } as Partial<DemoConfig>);
    this.flashSaved();
  }

  onImageChange(key: keyof DemoConfig, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.demoConfig.replaceImageFromFile(key, file);
    this.flashSaved();
  }

  onProductImageChange(index: number, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const key = `boutiqueProduct${index}` as keyof DemoConfig;
    this.demoConfig.replaceImageFromFile(key, file);
    this.flashSaved();
  }

  getProductImage(index: number): string {
    const key = `boutiqueProduct${index}` as keyof DemoConfig;
    return this.cfg()[key] as string;
  }

  onReset(): void {
    if (confirm('¿Restablecer todas las imágenes y configuración al estado original?')) {
      this.demoConfig.reset();
    }
  }

  applyPreset(preset: 'nude' | 'dark' | 'rose' | 'clean'): void {
    if (preset === 'nude') {
      this.demoConfig.update({
        boutiquePrimaryColor: '#1e1b19',
        boutiqueAccentColor: '#c5a882',
        boutiqueBgColor: '#ffffff',
        boutiqueFooterBgColor: '#c4b4a1',
        boutiqueButtonBgColor: '#1a1a1a',
        boutiqueButtonTextColor: '#ffffff',
      });
    } else if (preset === 'dark') {
      this.demoConfig.update({
        boutiquePrimaryColor: '#121212',
        boutiqueAccentColor: '#e2b857',
        boutiqueBgColor: '#1a1a1a',
        boutiqueFooterBgColor: '#0a0a0a',
        boutiqueButtonBgColor: '#e2b857',
        boutiqueButtonTextColor: '#121212',
      });
    } else if (preset === 'rose') {
      this.demoConfig.update({
        boutiquePrimaryColor: '#4a2e35',
        boutiqueAccentColor: '#d48c9c',
        boutiqueBgColor: '#fff8f9',
        boutiqueFooterBgColor: '#4a2e35',
        boutiqueButtonBgColor: '#d48c9c',
        boutiqueButtonTextColor: '#ffffff',
      });
    } else if (preset === 'clean') {
      this.demoConfig.update({
        boutiquePrimaryColor: '#0f172a',
        boutiqueAccentColor: '#38bdf8',
        boutiqueBgColor: '#f8fafc',
        boutiqueFooterBgColor: '#0f172a',
        boutiqueButtonBgColor: '#0f172a',
        boutiqueButtonTextColor: '#ffffff',
      });
    }
    this.flashSaved();
  }

  private flashSaved(): void {
    this.showSaved.set(true);
    setTimeout(() => this.showSaved.set(false), 2000);
  }
}
