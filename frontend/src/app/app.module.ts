import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AppInterceptorService } from './core/services';
import { AppLayoutModule } from './layout/app.layout.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CognitoCallbackComponent } from './cognito-callback/cognito-callback.component';
import { GoogleAnalyticsService } from './core/services/google-analytics.service';

import { Amplify } from 'aws-amplify'; 
import { environment } from 'src/environments/environment'; 

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: environment.cognito_user_pool_id,
            userPoolClientId: environment.cognito_client_id
        },
    },
});




@NgModule({
    declarations: [
        AppComponent,
        CognitoCallbackComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        CoreModule,
        SharedModule,
        AppRoutingModule,
        AppLayoutModule
    ],
    providers: [
        GoogleAnalyticsService,
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: HTTP_INTERCEPTORS, useClass: AppInterceptorService, multi: true }
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }
