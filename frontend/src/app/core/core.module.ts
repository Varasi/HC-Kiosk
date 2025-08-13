import { NgModule, Optional, SkipSelf } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { MessageService } from 'primeng/api';

import { SharedModule } from '../shared/shared.module';
import { AppEnsureModuleLoadedOnceGuard } from './guards';
import {
  AppAuthService,
  AppDataService,
  AppInterceptorService,
  AppNotificationService
} from './services';
import { AppSpeechService } from './services/app.speech.service';

@NgModule({
  imports: [
    RouterModule,
    HttpClientModule,
    SharedModule
  ],
  exports: [
    RouterModule,
    HttpClientModule,
  ],
  declarations: [],
  providers: [
    MessageService,
    AppAuthService,
    AppInterceptorService,
    AppNotificationService,    
    AppDataService
  ], // these should be singleton
})
export class CoreModule extends AppEnsureModuleLoadedOnceGuard {
  // Ensure that CoreModule is only loaded into AppModule

  // Looks for the module in the parent injector to see if it's already been loaded
  // (only want it loaded once)
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    super(parentModule);
  }
}
