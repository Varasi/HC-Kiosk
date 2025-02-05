import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { TicketService } from 'src/app/core/services';
import { environment } from 'src/environments/environment';
import { TimeoutService } from 'src/app/core/services/timeout.service';

import { GoogleAnalyticsService } from 'src/app/core/services/google-analytics.service';


@Component({
  selector: 'app-account-book-trip',
  templateUrl: './account-book-trip.component.html',
  styleUrls: ['./account-book-trip.component.scss']
})
export class AccountBookTripComponent implements OnInit {   
  submitted: boolean = false;
  loginOption: boolean = false;
  termsDialogVisible: boolean = true;
  timeoutDialogVisible: boolean = false;
  timeoutDialogInterval: any;
  userTimeoutTimer: any;
  disableEmailInput: boolean = false;
  useEmail: boolean = true;

  @ViewChild('fname') firstnameElement: ElementRef;

  constructor(

    public ticketService: TicketService,
    private router: Router,
    public timeoutService: TimeoutService,
    protected gaService: GoogleAnalyticsService
    ) { 
  }

  ngOnInit() {
    this.loginOption = this.ticketService.ticketInformation.accountOption.existing;
    this.setTimeoutDialogTimer();
    this.focusFirstNameInput();
  }

  nextPage() {
    // if email input is disabled, use default email address
    if (!this.useEmail) {
      const firstName = this.ticketService.ticketInformation.personalInformation.firstname.trim().toLowerCase().replace(' ', '_');
      const lastName = this.ticketService.ticketInformation.personalInformation.lastname.trim().toLowerCase().replace(' ', '_');
      this.ticketService.ticketInformation.personalInformation.email = firstName.concat('_', lastName, '@hirta.us');
    }

    if (this.ticketService.ticketInformation.personalInformation.firstname &&
      this.ticketService.ticketInformation.personalInformation.lastname &&
      this.ticketService.ticketInformation.personalInformation.email &&
      this.ticketService.ticketInformation.personalInformation.phone) {
        // clear timers
        this.timeoutService.clearAllTimers();

        this.router.navigate(['destination']);
    }

    this.submitted = true;
  }

  prevPage() {
    // clear timers
    this.timeoutService.clearAllTimers();

    this.ticketService.bookTrip = true;
    this.ticketService.initialCheck = false;
  }

  // highlights the first name input box
  focusFirstNameInput() {
    setTimeout(() => {
      if (this.firstnameElement)
        this.firstnameElement.nativeElement.focus();
    }, 10);
  }

  // controls when dialog boxes are visible and associated timers
  toggleDialog(): void {
        if (this.timeoutDialogVisible == true) {
          // close the timeout dialog, clear the timeout timer, and reset the timeout dialog timer
          this.timeoutDialogVisible = false;
          this.timeoutService.clearTimeout(this.userTimeoutTimer);
          this.setTimeoutDialogTimer();
          this.focusFirstNameInput();
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

  // go back to home page
  userTimeout() {
    // clear timers
    this.timeoutService.clearAllTimers();

    this.ticketService.bookTrip = true;
    this.ticketService.initialCheck = false;
    }

  disableEmail() {
    this.useEmail = !this.useEmail;
  }
}