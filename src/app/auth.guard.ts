import { CanActivateFn, Router } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { AppAuthService } from './core/services/app.auth.service';  // Import the service
import { firstValueFrom } from 'rxjs';


export const authGuard: CanActivateFn =  async (route, state) => {

  const authService = inject(AppAuthService);  // Inject the AppAuthService here
  const isAuthenticated= await authService.getIsLogin();
  if (isAuthenticated) {
    return true;
  } else {
    return false;
  }
};
