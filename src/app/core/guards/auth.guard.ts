import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/api/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Allow prerendering during SSR build
  if (typeof window === 'undefined') {
    return true;
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login page if not authenticated
  router.navigate(['/login']);
  return false;
};
