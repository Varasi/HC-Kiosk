import { HostListener, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { AppDataService, TicketService, AppAuthService } from 'src/app/core/services';
import { IErrorResponse, IRiderDetails } from 'src/app/shared/models';
import { environment } from 'src/environments/environment';

import { GoogleAnalyticsService } from 'src/app/core/services/google-analytics.service';
import { TimeoutService } from 'src/app/core/services/timeout.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-account-check-trip',
  templateUrl: './account-check-trip.component.html',
  styleUrls: ['./account-check-trip.component.scss']
})
export class AccountCheckTripComponent implements OnInit {
  @ViewChild('fname1') firstname1Element: ElementRef;
  @ViewChild('fname2') firstname2Element: ElementRef;

  submitted: boolean = false;
  loginOption: boolean = false;
  checking: boolean = false;
  disableEmailInput: boolean = false;
  useEmail: boolean = true;
  timeoutDialogVisible: boolean = false;
  timeoutDialogInterval: any;
  userTimeoutTimer: any;


  constructor(
    public ticketService: TicketService,
    private dataService: AppDataService,
    private authService: AppAuthService,
    private router: Router,
    protected gaService: GoogleAnalyticsService,
    public timeoutService: TimeoutService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.loginOption = this.ticketService.ticketInformation.accountOption.existing;

    setTimeout(() => {
      if (this.firstname1Element)
        this.firstname1Element.nativeElement.focus();

      if (this.firstname2Element)
        this.firstname2Element.nativeElement.focus();
    }, 10);

    this.setTimeoutDialogTimer();
  }

  nextPage() {
    this.checking = true;
    
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
      let payload: IRiderDetails = {
        first_name: this.ticketService.ticketInformation.personalInformation.firstname,
        last_name: this.ticketService.ticketInformation.personalInformation.lastname,
        phone_number: `+1${this.ticketService.ticketInformation.personalInformation.phone}`,
        email_address: this.ticketService.ticketInformation.personalInformation.email,
        sub_service: environment.hirta_via_account_name
      };

      if (this.authService.validateToken(true)) {
        this.dataService.checkAPreviouslyKioskBookedTrip(payload, this.authService.idToken).subscribe({
          next: (trip_data: any) => {
            if (trip_data instanceof Object && trip_data.hasOwnProperty('trip_details')) {
              this.ticketService.checkComplete(trip_data.trip_details); // do some checks here
              this.submitted = true;
                this.router.navigate(['pickup']);
            } else if (typeof trip_data === 'string' && trip_data.includes('MOD/ATMS Error:')) {
              let errorInfo = trip_data.replace('MOD/ATMS Error:', '').trim();
              let errorData: IErrorResponse;
              try {
                errorData = JSON.parse(errorInfo);
                console.log("errorData:", errorData);
                if(errorData.message === 'FailedToGetOrCreateRider')
                  this.ticketService.checkError(this.translate.instant('Failed to get the rider - please check your personal information and try again!'));
                else
                  console.error('Error parsing error data:', errorData);
                  this.ticketService.checkError(errorData.message);
              } catch (e) {
                if(errorInfo.includes('No upcoming trips')){
                  this.ticketService.checkError(this.translate.instant('No upcoming trips.'));
                }else{
                  console.error('Error parsing error info:', errorInfo);
                  this.ticketService.checkError(errorInfo);
                }

              }
            }
            this.checking = false;
          },
          error: (error) => {
            console.error(error);
            this.checking = false;
            this.ticketService.checkError(this.translate.instant('Error checking the trip! Please try again later!'));
          },
          complete: () => {
            console.log('check complete');
          }
        });
      }
    } 
  }

  prevPage() {
    this.ticketService.bookTrip = true;
    this.ticketService.initialCheck = false;
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
  disableEmail() {
    this.useEmail = !this.useEmail;
  }
}
