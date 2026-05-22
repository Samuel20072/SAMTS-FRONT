import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, Button, Card, InputText],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  name = signal('');
  isDark = signal(false);

  toggleDarkMode() {
    this.isDark.set(!this.isDark());
    const html = document.documentElement;
    if (this.isDark()) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}
