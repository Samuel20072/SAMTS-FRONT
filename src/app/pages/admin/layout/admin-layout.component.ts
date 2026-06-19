import { Component, signal, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../services/theme.service';

interface ChatMessage {
  text: string;
  sender: 'ai' | 'admin';
  time: string;
  type?: 'text' | 'action';
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, FormsModule],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent implements AfterViewChecked {
  @ViewChild('copilotScroll') private copilotScrollContainer!: ElementRef;

  themeService = inject(ThemeService);
  isDark = this.themeService.isDark;
  sidebarOpen = signal(true);
  copilotOpen = signal(false);
  isCopilotTyping = signal(false);
  copilotInput = '';

  copilotMessages = signal<ChatMessage[]>([
    {
      text: '¡Hola Admin! Soy tu Copiloto Neural. ¿Qué cambios quieres hacer hoy en la plataforma o sobre qué necesitas ideas?',
      sender: 'ai',
      time: this.getCurrentTime()
    }
  ]);
  
  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  toggleCopilot() {
    this.copilotOpen.set(!this.copilotOpen());
  }

  sendCopilotMessage() {
    if (!this.copilotInput.trim()) return;

    const userText = this.copilotInput;
    this.copilotInput = '';
    
    this.copilotMessages.update(msgs => [...msgs, {
      text: userText,
      sender: 'admin',
      time: this.getCurrentTime()
    }]);

    this.isCopilotTyping.set(true);

    setTimeout(() => {
      this.isCopilotTyping.set(false);
      this.copilotMessages.update(msgs => [...msgs, {
        text: 'Entendido. Procesando el código de la vista actual y aplicando los estilos requeridos. ¿Deseas que lo despliegue en producción ahora mismo?',
        sender: 'ai',
        time: this.getCurrentTime(),
        type: 'action'
      }]);
    }, 1800);
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  }

  ngAfterViewChecked() {
    try {
      if (this.copilotScrollContainer && this.copilotOpen()) {
        this.copilotScrollContainer.nativeElement.scrollTop = this.copilotScrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}
