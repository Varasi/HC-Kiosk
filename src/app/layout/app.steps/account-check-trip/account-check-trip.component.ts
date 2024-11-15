  import { Component, ElementRef, ViewChild } from '@angular/core';
  import { TicketService } from '../../../core/services/app.ticketservice.service';
  import { AppDataService } from '../../../core/services/app.data.service';
  import { Router } from '@angular/router';
  import { IErrorResponse, IRiderDetails } from '../../../shared/models';
  import { environment } from '../../../../environments/environment';
  import { NgxTouchKeyboardModule } from 'ngx-touch-keyboard';
  import { CardModule } from 'primeng/card';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { ButtonModule } from 'primeng/button';


  @Component({
    selector: 'account-check-trip',
    standalone: true,
    imports: [FormsModule,CommonModule,CardModule,NgxTouchKeyboardModule,ButtonModule],
    providers:[AppDataService],
    templateUrl: './account-check-trip.component.html',
    styleUrl: './account-check-trip.component.scss'
  })
  export class AccountCheckTripComponent {
    @ViewChild('fname1') firstname1Element !: ElementRef;
    @ViewChild('fname2') firstname2Element !: ElementRef;

    submitted: boolean = false;
    loginOption: boolean = false;
    checking: boolean = false;

    constructor(
      public ticketService: TicketService,
      private dataService: AppDataService,
      private router: Router) { }

    ngOnInit() {
      this.loginOption = this.ticketService.ticketInformation.accountOption.existing;

      setTimeout(() => {
        if (this.firstname1Element)
          this.firstname1Element.nativeElement.focus();

        if (this.firstname2Element)
          this.firstname2Element.nativeElement.focus();
      }, 10);
    }

    nextPage() {
      this.checking = true;
      //this.router.navigate(['pickup']);  //change made **
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

        //The following block of code requests an authentication token before proceeding
        //Comment out this block to bypass authentication

        this.dataService.getAuthToken().subscribe({
          next: (token: any) => {
        //Replacing the `checkAPreviouslyKioskBookedTrip` call to use a dummy token or bypass it entirely
        this.dataService.checkAPreviouslyKioskBookedTrip(payload, token.access_token).subscribe({
          next: (trip_data: any) => {

            if (trip_data instanceof Object && trip_data.hasOwnProperty('trip_details')) {
              console.log('73');
              this.ticketService.checkComplete(trip_data.trip_details); // do some checks here
              this.submitted = true;
              this.router.navigate(['pickup']);
              } else if (typeof trip_data === 'string' && trip_data.includes('MOD/ATMS Error:')) {
              let errorInfo = trip_data.replace('MOD/ATMS Error:', '').trim();
              let errorData: IErrorResponse;
              try {
                errorData = JSON.parse(errorInfo);
                if(errorData.message === 'FailedToGetOrCreateRider')
                  this.ticketService.checkError('Failed to get the rider - please check your personal information and try again!');
                else
                  this.ticketService.checkError(errorData.message || 'An unknown error occurred.');
              } catch (e) {
                this.ticketService.checkError(errorInfo);
              }
            }
            this.checking = false;
          },
          error: (error) => {
            console.error(error);
            this.checking = false;
            this.ticketService.checkError('Error checking the trip! Please try again later!');
          },
          complete: () => {
            console.log('check complete');
          }
        });
          },
          error: (error) => {
            console.log(error);
            this.ticketService.checkError('Error checking the trip - communication error!');
          },
          complete: () => {
            console.log('token complete');
          }
        });
      }
    }
    prevPage() {
      this.ticketService.bookTrip = true;
      this.ticketService.initialCheck = false;
    }
  }
