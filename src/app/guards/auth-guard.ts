import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Si hay token, le dejamos pasar
  } else {
    router.navigate(['/login']); // Si no, lo mandamos de vuelta al login
    return false;
  }
};