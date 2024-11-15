import { Component, ElementRef, ViewChild } from '@angular/core';
import { TicketService } from '../../../core/services/app.ticketservice.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { NgxTouchKeyboardModule } from 'ngx-touch-keyboard';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'account-book-trip',
  standalone: true,
  imports: [FormsModule,CommonModule,CardModule,NgxTouchKeyboardModule,ButtonModule],
  templateUrl: './account-book-trip.component.html',
  styleUrl: './account-book-trip.component.scss'
})
export class AccountBookTripComponent {
  submitted: boolean = false;
  loginOption: boolean = false;

  @ViewChild('fname') firstnameElement !: ElementRef;

  constructor(
    public ticketService: TicketService,
    private router: Router) { }

  ngOnInit() {
      // Commented: This line is related to checking whether the user has an existing account option, possibly related to authentication
      // this.loginOption = this.ticketService.ticketInformation.accountOption.existing;
  
      setTimeout(() => {
        if (this.firstnameElement)
          this.firstnameElement.nativeElement.focus();
      }, 10);
  }

  nextPage() {
    //this.router.navigate(['destination']); //**change */
    if (this.ticketService.ticketInformation.personalInformation.firstname &&
      this.ticketService.ticketInformation.personalInformation.lastname &&
      this.ticketService.ticketInformation.personalInformation.email &&
      this.ticketService.ticketInformation.personalInformation.phone) {
        this.router.navigate(['destination']);
    }
    this.submitted = true;
  }
  prevPage() {
    //Commented: These lines may involve a logic related to booking flow or user status
    this.ticketService.bookTrip = true;
    this.ticketService.initialCheck = false;
  }


}
