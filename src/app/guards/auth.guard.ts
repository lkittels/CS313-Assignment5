import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase.config';

function resolveAuthState(): Promise<boolean> {
  if (auth.currentUser) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(!!user);
    });
  });
}

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const isAuthenticated = await resolveAuthState();

  if (isAuthenticated) {
    return true;
  }

  return router.parseUrl('/login');
};

export const guestOnlyGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const isAuthenticated = await resolveAuthState();

  if (isAuthenticated) {
    return router.parseUrl('/');
  }

  return true;
};
