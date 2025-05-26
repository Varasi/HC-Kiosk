import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from 'src/environments/environment';

import { GoogleAnalyticsService } from 'src/app/core/services/google-analytics.service';


import { 
  IDriverInfo, 
  IResponseAddress, 
  ITripDetails, 
  ITripResponseDetails, 
  IVehicleInfo } from 'src/app/shared/models';
import { AppLayoutService, TicketService } from 'src/app/core/services';
import { TimeoutService } from 'src/app/core/services/timeout.service';

@Component({
  selector: 'app-pickup',
  templateUrl: './pickup.component.html',
  styleUrls: ['./pickup.component.scss']
})
export class PickupComponent {

  private tripResponse: ITripResponseDetails;
  private tripDetails: ITripDetails;

  vehicleInfo: IVehicleInfo;
  driverInfo: IDriverInfo;
  pickupAddress: IResponseAddress;
  estimatedTime: string;
  timeoutDialogVisible: boolean = false;
  timeoutDialogInterval: any;
  userTimeoutTimer: any;

  constructor(
    public layoutService: AppLayoutService,
    public ticketService: TicketService,
    private router: Router,
    protected gaService: GoogleAnalyticsService,
    public timeoutService: TimeoutService
  ) {
    if (!this.ticketService.bookTrip) {
      this.tripDetails = ticketService.tripDetails;
      this.vehicleInfo = ticketService.tripDetails.vehicle_info;
      this.driverInfo = ticketService.tripDetails.driver_info;
      this.pickupAddress = this.tripDetails.pickup;
      this.estimatedTime = ticketService.estimateTime(this.tripDetails.pickup_eta);
    } else {
      this.tripDetails = null;
      this.vehicleInfo = null;
      this.driverInfo = null;
      this.tripResponse = ticketService.tripResponse;
      this.pickupAddress = ticketService.tripResponse.pickup;
      this.estimatedTime = ticketService.estimateTime(this.tripResponse.pickup_eta);
    }
  }
    
  ngOnInit() {
    this.setTimeoutDialogTimer();
  }

  done() {
    // clear timers
    this.timeoutService.clearAllTimers();

    if (this.layoutService.audio)
      window.speechSynthesis.speak(new SpeechSynthesisUtterance('Thank you for booking your trip with us. Have a great day!'));

    this.ticketService.bookTrip = true;
    this.ticketService.initialCheck = false;
  }

  prevPage() {
    // clear timers
    this.timeoutService.clearAllTimers();

    if (this.ticketService.bookTrip) {
      this.router.navigate(['destination']);
    } else {
      this.router.navigate(['account-check-trip']);
    }
  }

  // controls when dialog boxes are visible and associated timers
  toggleDialog(): void {
    if (this.timeoutDialogVisible == true) {
      // close the timeout dialog, clear the timeout timer, and reset the timeout dialog timer
      this.timeoutDialogVisible = false;
      this.timeoutService.clearTimeout(this.userTimeoutTimer);
      this.setTimeoutDialogTimer();
    } else {
      // show the timeout dialog, clear the timeout dialog timer, and start the timeout dialog
      this.timeoutDialogVisible = true;
      this.timeoutService.clearInterval(this.timeoutDialogInterval);
      this.setUserTimeout();
    }        
  }

  // start timer to open the timeout dialog ("Are you still there?")
  setTimeoutDialogTimer() {
    this.timeoutDialogInterval = setInterval(() => {
      this.toggleDialog();
    }, environment.user_max_time);

    // register interval with timeout service
    this.timeoutService.intervalIds.push(this.timeoutDialogInterval);
  }

  // start the timeout timer (to go back to the homepage)
  setUserTimeout() {
    this.userTimeoutTimer = setTimeout(() => {
      this.userTimeout();
    }, environment.user_max_time_warn)

    // register timeout with timeout service
    this.timeoutService.timeoutIds.push(this.userTimeoutTimer);
  }

  userTimeout() {
    // clear timers
    this.timeoutService.clearAllTimers();

    this.ticketService.bookTrip = true;
    this.ticketService.initialCheck = false;
  }
}

