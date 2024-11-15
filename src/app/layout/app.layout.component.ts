import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { TicketService } from '../core/services/app.ticketservice.service';
import { Subscription } from 'rxjs';
import { AppLayoutService } from '../core/services/app.layout.service';
import { AppTopbarComponent } from './app.topbar/app.topbar.component';
import { ButtonModule } from 'primeng/button';
import { ToastService } from '../core/services/toast.service';
import { ToastComponent } from '../toast.component';

@Component({
  selector: 'app-layout',
  standalone: true, 
  imports: [ToastComponent,ToastModule,CardModule,StepsModule,CommonModule,AppTopbarComponent,ButtonModule],
  providers:[ToastService,MessageService,TicketService],
  templateUrl: './app.layout.component.html',
  styleUrls: ['./app.layout.component.scss']
})
export class AppLayoutComponent implements OnInit, OnDestroy{

    itemsTripBooking: MenuItem[] = [];
    itemsTripCheck: MenuItem[] = [];

    bookingCompleteSubscription = <Subscription>{};
    bookingErrorSubscription = <Subscription>{};
    checkTripCompleteSubscription = <Subscription>{};
    checkTripErrorSubscription = <Subscription>{};

    constructor(
        public messageService: MessageService,
        public ticketService: TicketService,
        public layoutService: AppLayoutService,
        public toastService:ToastService,
        private router: Router) { }

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
        this.itemsTripBooking = [
            { label: 'Account', routerLink: 'account-book-trip' },
            { label: 'Destination', routerLink: 'destination' },
            { label: 'Pickup', routerLink: 'pickup' }
        ];

        this.itemsTripCheck = [
            { label: 'Account', routerLink: 'account-check-trip' },
            { label: 'Pickup', routerLink: 'pickup' }
        ];

        this.bookingCompleteSubscription = this.ticketService.bookingComplete$.subscribe(
            (personalInformation) => {
                if (!personalInformation['estimatedTime'] || personalInformation['estimatedTime'] === 'n/a') {
                    if (this.layoutService.audio) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance('Trip booked'));
                    }
                } else {
                    if (this.layoutService.audio) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance('Trip booked. Estimated time of pickup: ' + personalInformation['estimatedTime']));
                    }
                }
                // this.messageService.add({
                //     severity: 'success',
                //     summary: 'Order submitted',
                //     detail: 'Dear ' + personalInformation.firstname + ' ' + personalInformation.lastname + ' your order is completed.',
                //     life: 10000
                // });
                this.toastService.showToast('Dear ' + personalInformation.firstname + ' ' + personalInformation.lastname + ' your order is completed.', 'success');
            });

        this.bookingErrorSubscription = this.ticketService.bookingError$.subscribe(
            (errorInfo) => {
                if (this.layoutService.audio)
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance('Failed to book the trip: ' + errorInfo));

                // this.messageService.add({
                //     severity: 'error',
                //     summary: 'Failed to book the trip',
                //     detail: errorInfo,
                //     life: 10000
                // });
                this.toastService.showToast('Failed to book the trip.', 'error');
            });

        this.checkTripCompleteSubscription = this.ticketService.tripCheckComplete$.subscribe(
            (personalInformation) => {
                if (!personalInformation['estimatedTime'] || personalInformation['estimatedTime'] === 'n/a') {
                    if (this.layoutService.audio)
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance('Trip successfully checked'));
                } else {
                    if (this.layoutService.audio)
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance('Trip successfully checked. Estimated time of pickup: ' + personalInformation['estimatedTime']));
                }

                // this.messageService.add({
                //     severity: 'success',
                //     summary: 'Trip checked',
                //     detail: 'Dear ' + personalInformation.firstname + ' ' + personalInformation.lastname + ' your trip is checked.',
                //     life: 10000
                // });
                this.toastService.showToast('Dear ' + personalInformation.firstname + ' ' + personalInformation.lastname + ' your trip is checked.', 'success');
            });

        this.checkTripErrorSubscription = this.ticketService.tripCheckError$.subscribe(
            (errorInfo) => {
                if (this.layoutService.audio)
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance('Check trip error: ' + errorInfo));

                // this.messageService.add({
                //     severity: 'error',
                //     summary: 'Check Trip Error',
                //     detail: errorInfo,
                //     life: 10000
                // });
                this.toastService.showToast(errorInfo, 'error');
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
    }

    onBookTrip() {
        this.ticketService.bookTrip = true;
        this.ticketService.initialCheck = true;
        this.ticketService.reset();

        if (this.layoutService.audio)
            window.speechSynthesis.speak(new SpeechSynthesisUtterance('Book a trip'));

        this.router.navigate(['/account-book-trip']);
    }

    onCheckTrip() {
        this.ticketService.bookTrip = false;
        this.ticketService.initialCheck = true;
        this.ticketService.reset();

        if (this.layoutService.audio)
            window.speechSynthesis.speak(new SpeechSynthesisUtterance('Check a previously booked trip'));
        
        this.router.navigate(['/account-check-trip']);
    }
}