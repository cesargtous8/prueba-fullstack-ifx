import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (roles: Array<'Administrador' | 'Cliente'>): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return roles.includes((auth.role() as 'Administrador' | 'Cliente') ?? 'Cliente')
      ? true
      : router.createUrlTree(['/dashboard']);
  };