import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { TicketService } from './core/services/app.ticketservice.service';
import { ToastComponent } from './toast.component';

export const appConfig: ApplicationConfig = {
  
  providers: [ToastComponent,provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),provideHttpClient(),TicketService],
  
};
