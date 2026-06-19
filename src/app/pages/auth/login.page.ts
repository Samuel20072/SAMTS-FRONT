import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/api/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './login.page.html'
})
export class LoginPage {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  private router = inject(Router);
  private authService = inject(AuthService);

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, ingrese correo y contraseña.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.isLoading = false;
        
        // Extract error message from backend response
        if (err.error && err.error.message) {
          // Sometimes backend returns an array of messages (e.g. class-validator)
          if (Array.isArray(err.error.message)) {
            this.errorMessage = err.error.message.join(', ');
          } else {
            this.errorMessage = err.error.message;
          }
        } else {
          this.errorMessage = 'Ocurrió un error inesperado al iniciar sesión.';
        }
        
        console.error('Login error', err);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
