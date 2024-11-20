import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { BadgeModule } from 'primeng/badge';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';

import { SharedModule } from '../shared/shared.module';
import { TicketService } from '../core/services';
import { NgxTouchKeyboardModule } from '../directive/ngx-touch-keyboard/ngx-touch-keyboard.module';
import { AppTopbarComponent } from './app.topbar/app.topbar.component';
import { AppLayoutComponent } from "./app.layout.component";
import { AccountBookTripComponent } from './app.steps/account-book-trip/account-book-trip.component';
import { DestinationComponent } from './app.steps/destination/destination.component';
import { PickupComponent } from './app.steps/pickup/pickup.component';
import { AccountCheckTripComponent } from './app.steps/account-check-trip/account-check-trip.component';
import { AppLoginComponent } from './app.login/app.login.component';

@NgModule({
    declarations: [
        AppTopbarComponent,
        AppLayoutComponent,
        AccountBookTripComponent,
        DestinationComponent,
        PickupComponent,
        AccountCheckTripComponent,
        AppLoginComponent
    ],
    imports: [
        BrowserModule,
        ButtonModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        InputTextModule,
        SidebarModule,
        BadgeModule,
        RadioButtonModule,
        InputSwitchModule,
        RippleModule,
        RouterModule,
        SharedModule,
        NgxTouchKeyboardModule
    ],
    providers: [
        DialogService,
        TicketService
    ],
    exports: [
        AppLayoutComponent
    ]
})
export class AppLayoutModule { }
