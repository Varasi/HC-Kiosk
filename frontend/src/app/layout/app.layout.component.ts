import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';
import { MenuItem, MessageService } from 'primeng/api';

import { AppLayoutService, TicketService } from '../core/services';
import { Router } from '@angular/router';

import { GoogleAnalyticsService } from 'src/app/core/services/google-analytics.service';
import { AppSpeechService } from 'src/app/core/services/app.speech.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-layout',
    templateUrl: './app.layout.component.html',
    styleUrls: ['./app.layout.component.scss']
})
export class AppLayoutComponent implements OnInit, OnDestroy {
    itemsTripBooking: MenuItem[];
    itemsTripCheck: MenuItem[];

    bookingCompleteSubscription: Subscription;
    bookingErrorSubscription: Subscription;
    checkTripCompleteSubscription: Subscription;
    checkTripErrorSubscription: Subscription;
    languageSubscription: Subscription;

    visible: boolean = false;

    // switches the visible property, used to open or close the 
    // terms and conditions dialog box on the home page
    toggleDialog(): void {
        this.visible = !this.visible;
    }

    constructor(
        public messageService: MessageService,
        public ticketService: TicketService,
        public layoutService: AppLayoutService,
        private router: Router,
        protected gaService: GoogleAnalyticsService,
        private speechService: AppSpeechService,
        private translate: TranslateService
    ) { }

    get containerClass() {
        return {
            'layout-theme-light': this.layoutService.config.colorScheme === 'light',
            'layout-theme-dark': this.layoutService.config.colorScheme === 'dark',
            'layout-overlay': this.layoutService.config.menuMode === 'overlay',
            'layout-static': this.layoutService.config.menuMode === 'static',
            'layout-static-inactive': this.layoutService.state.staticMenuDesktopInactive && this.layoutService.config.menuMode === 'static',
            'layout-overlay-active': this.layoutService.state.overlayMenuActive,
            'layout-mobile-active': this.layoutService.state.staticMenuMobileActive,
            'p-input-filled': this.layoutService.config.inputStyle === 'filled',
            'p-ripple-disabled': !this.layoutService.config.ripple
        }
    }

    ngOnInit() {
        console.log('AppLayoutComponent initialized');
        this.layoutService.changeLanguage('en');
        console.log('Current language:', this.layoutService.language);
        if (this.layoutService.language === 'en'){
            this.itemsTripBooking = [
                { label: 'Account', routerLink: 'account-book-trip' },
                { label: 'Destination', routerLink: 'destination' },
                { label: 'Pickup', routerLink: 'pickup' }
            ];

            this.itemsTripCheck = [
                { label: 'Account', routerLink: 'account-check-trip' },
                { label: 'Pickup', routerLink: 'pickup' }
            ];
        } else {
            this.itemsTripBooking = [
                { label: 'Cuenta', routerLink: 'account-book-trip' },
                { label: 'Destino', routerLink: 'destination' },
                { label: 'Recogida', routerLink: 'pickup' }
            ];

            this.itemsTripCheck = [
                { label: 'Cuenta', routerLink: 'account-check-trip' },
                { label: 'Recogida', routerLink: 'pickup' }
            ];
        }
        
        this.languageSubscription = this.layoutService.languageChange$.subscribe(
            (language) => {
                if (language === 'en') {
                    this.itemsTripBooking = [
                        { label: 'Account', routerLink: 'account-book-trip' },
                        { label: 'Destination', routerLink: 'destination' },
                        { label: 'Pickup', routerLink: 'pickup' }
                    ];

                    this.itemsTripCheck = [
                        { label: 'Account', routerLink: 'account-check-trip' },
                        { label: 'Pickup', routerLink: 'pickup' }
                    ];
                } else {
                    this.itemsTripBooking = [
                        { label: 'Cuenta', routerLink: 'account-book-trip' },
                        { label: 'Destino', routerLink: 'destination' },
                        { label: 'Recogida', routerLink: 'pickup' }
                    ];

                    this.itemsTripCheck = [
                        { label: 'Cuenta', routerLink: 'account-check-trip' },
                        { label: 'Recogida', routerLink: 'pickup' }
                    ];
                }
            });

        this.bookingCompleteSubscription = this.ticketService.bookingComplete$.subscribe(
            (personalInformation) => {
                if (!personalInformation['estimatedTime'] || personalInformation['estimatedTime'] === 'n/a') {
                    if (this.layoutService.audio) {
                        this.speechService.speak(this.translate.instant('Trip booked'));
                    }
                } else {
                    if (this.layoutService.audio) {
                        this.speechService.speak(this.translate.instant('Trip booked')+'.'+this.translate.instant('Estimated time of pickup')+': '+ personalInformation['estimatedTime']);
                    }
                }
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('Order submitted'),
                    detail: this.translate.instant('Dear')+' ' + personalInformation.firstname + ' ' + personalInformation.lastname + ' '+this.translate.instant('your order is completed.'),
                    life: 10000
                });
            });

        this.bookingErrorSubscription = this.ticketService.bookingError$.subscribe(
            (errorInfo) => {
                if (this.layoutService.audio)
                    this.speechService.speak(this.translate.instant('Failed to book the trip')+': ' + errorInfo);

                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('Failed to book the trip'),
                    detail: errorInfo,
                    life: 10000
                });
            });

        this.checkTripCompleteSubscription = this.ticketService.tripCheckComplete$.subscribe(
            (personalInformation) => {
                if (!personalInformation['estimatedTime'] || personalInformation['estimatedTime'] === 'n/a') {
                    if (this.layoutService.audio)
                        this.speechService.speak(this.translate.instant('Trip successfully checked'));
                } else {
                    if (this.layoutService.audio)
                        this.speechService.speak(this.translate.instant('Trip successfully checked')+'. ' + this.translate.instant('Estimated time of pickup')+': ' + personalInformation['estimatedTime']);
                }

                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('Trip checked'),
                    detail: this.translate.instant('Dear')+' ' + personalInformation.firstname + ' ' + personalInformation.lastname + ' '+this.translate.instant('your trip is checked.'),
                    life: 10000
                });
            });

        this.checkTripErrorSubscription = this.ticketService.tripCheckError$.subscribe(
            (errorInfo) => {
                if (this.layoutService.audio)
                    this.speechService.speak(this.translate.instant('Check trip error')+': ' + errorInfo);

                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('Check Trip Error'),
                    detail: errorInfo,
                    life: 10000
                });
            });
    }

    ngOnDestroy() {
        if (this.bookingCompleteSubscription) {
            this.bookingCompleteSubscription.unsubscribe();
        }
        if (this.bookingErrorSubscription) {
            this.bookingErrorSubscription.unsubscribe();
        }
        if (this.checkTripCompleteSubscription) {
            this.checkTripCompleteSubscription.unsubscribe();
        }
        if (this.checkTripErrorSubscription) {
            this.checkTripErrorSubscription.unsubscribe();
        }
        if (this.languageSubscription) {
            this.languageSubscription.unsubscribe();
        }
    }

    onBookTrip() {
        this.ticketService.bookTrip = true;
        this.ticketService.initialCheck = true;
        this.ticketService.reset();

        if (this.layoutService.audio)
            this.speechService.speak(this.translate.instant('Book a trip'));

        this.router.navigate(['/account-book-trip']);
    }

    onCheckTrip() {
        this.ticketService.bookTrip = false;
        this.ticketService.initialCheck = true;
        this.ticketService.reset();

        if (this.layoutService.audio)
            this.speechService.speak(this.translate.instant('Check a previously booked trip'));
        
        this.router.navigate(['/account-check-trip']);
    }
}
