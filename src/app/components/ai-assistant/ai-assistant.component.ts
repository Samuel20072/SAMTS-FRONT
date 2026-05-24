import { Component, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  text: string;
  sender: 'ai' | 'user';
  time: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Button -->
    <div class="fixed bottom-6 right-6 z-50">
      <button 
        (click)="toggleChat()"
        [class.hidden]="isOpen()"
        class="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-110 transition-transform duration-300 relative group border border-slate-300 dark:border-white/10">
        
        <!-- Ripple effect -->
        <span class="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></span>
        
        <i class="pi pi-sparkles text-slate-900 dark:text-white text-2xl group-hover:animate-spin"></i>
        
        <!-- Notification dot -->
        <span class="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-950"></span>
      </button>

      <!-- Chat Window -->
      <div 
        [class.translate-y-4]="!isOpen()"
        [class.opacity-0]="!isOpen()"
        [class.pointer-events-none]="!isOpen()"
        class="absolute bottom-0 right-0 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-slate-100 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-300 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right">
        
        <!-- Header -->
        <div class="p-4 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <i class="pi pi-bolt text-slate-900 dark:text-white"></i>
              </div>
              <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-200 dark:border-slate-900 rounded-full"></span>
            </div>
            <div>
              <h4 class="text-slate-900 dark:text-white font-bold font-display text-sm">Neural Agent</h4>
              <p class="text-[10px] text-green-400 font-mono tracking-widest flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> ONLINE
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="w-8 h-8 rounded-full hover:bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors">
              <i class="pi pi-volume-up text-xs"></i>
            </button>
            <button (click)="toggleChat()" class="w-8 h-8 rounded-full hover:bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>

        <!-- Chat Area -->
        <div #chatScroll class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          <div *ngFor="let msg of messages()" class="flex flex-col" [class.items-end]="msg.sender === 'user'">
            
            <span class="text-[10px] text-slate-500 dark:text-slate-500 mb-1 mx-1">{{ msg.sender === 'ai' ? 'Neural Agent' : 'Tú' }} • {{ msg.time }}</span>
            
            <div 
              class="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-md"
              [ngClass]="msg.sender === 'user' ? 'bg-blue-600 text-slate-900 dark:text-white rounded-br-none' : 'bg-slate-900/5 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-bl-none'">
              {{ msg.text }}
            </div>
          </div>
          
          <!-- Typing indicator -->
          <div *ngIf="isTyping()" class="flex flex-col items-start">
            <span class="text-[10px] text-slate-500 dark:text-slate-500 mb-1 mx-1">Neural Agent está escribiendo...</span>
            <div class="bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
              <span class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-white/5">
          <form (ngSubmit)="sendMessage()" class="relative flex items-center">
            <input 
              type="text" 
              [(ngModel)]="userInput" 
              name="userInput"
              placeholder="Pregúntame cómo automatizar tu negocio..." 
              class="w-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900/10 dark:bg-white/10 transition-all shadow-inner"
              autocomplete="off"
              [disabled]="isTyping()">
            
            <button 
              type="submit" 
              [disabled]="!userInput.trim() || isTyping()"
              class="absolute right-2 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-slate-900 dark:text-white disabled:opacity-50 disabled:bg-slate-700 hover:bg-blue-500 transition-colors">
              <i class="pi pi-send text-xs -ml-0.5 mt-0.5"></i>
            </button>
          </form>
          <div class="text-center mt-2">
            <span class="text-[9px] text-slate-600 font-mono">POWERED BY SAMTS AI ENGINE</span>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AiAssistantComponent implements AfterViewChecked {
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;
  
  isOpen = signal(false);
  isTyping = signal(false);
  userInput = '';
  
  messages = signal<ChatMessage[]>([
    {
      text: '¡Hola! Soy el agente de IA de SAMTS. Analicé que estás viendo nuestros servicios. ¿Te gustaría saber cómo automatizar tus ventas?',
      sender: 'ai',
      time: this.getCurrentTime()
    }
  ]);

  toggleChat() {
    this.isOpen.set(!this.isOpen());
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userText = this.userInput;
    this.userInput = '';
    
    // Add user message
    this.messages.update(msgs => [...msgs, {
      text: userText,
      sender: 'user',
      time: this.getCurrentTime()
    }]);

    this.isTyping.set(true);

    // Simulate AI response delay
    setTimeout(() => {
      this.isTyping.set(false);
      this.messages.update(msgs => [...msgs, {
        text: 'Esa es una excelente pregunta. Nuestro ecosistema de IA se puede conectar directamente a tus redes sociales y sitio web para captar y cerrar clientes 24/7 de forma autónoma. ¿Quieres agendar una demo técnica?',
        sender: 'ai',
        time: this.getCurrentTime()
      }]);
    }, 1500);
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}
