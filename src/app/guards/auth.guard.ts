import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const registration = localStorage.getItem('CURRENT_REGISTRATION');
  const email = localStorage.getItem('CURRENT_EMAIL');

  if (registration && email) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};
