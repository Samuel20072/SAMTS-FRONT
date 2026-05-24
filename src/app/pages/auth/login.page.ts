import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './login.page.html'
})
export class LoginPage {
  email = '';
  password = '';

  constructor(private router: Router) {}

  login() {
    // Basic stub for login logic
    if (this.email && this.password) {
      this.router.navigate(['/admin']);
    }
  }
}
