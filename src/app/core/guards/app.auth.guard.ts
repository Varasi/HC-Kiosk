import { Injectable } from '@angular/core';
import {
  Route,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import { AppAuthService } from '../services';

@Injectable({ providedIn: 'root' })
export class AppAuthGuard {
  deniedMessage = 'Unauthorized access denied';

  constructor(
    public authService: AppAuthService,
    private router: Router) { }

  canLoad(route: Route) {
    if (this.authService.isAuthenticated) {
      return true;
    }

    this.router.navigate(['/login']);
    return this.authService.isAuthenticated;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isAuthenticated) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }
}
