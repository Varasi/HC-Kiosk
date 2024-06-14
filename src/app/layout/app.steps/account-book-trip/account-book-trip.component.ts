import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { TicketService } from 'src/app/core/services';

@Component({
  selector: 'app-account-book-trip',
  templateUrl: './account-book-trip.component.html',
  styleUrls: ['./account-book-trip.component.scss']
})
export class AccountBookTripComponent implements OnInit { 
  submitted: boolean = false;
  loginOption: boolean = false;

  @ViewChild('fname') firstnameElement: ElementRef;

  constructor(
    public ticketService: TicketService,
    private router: Router) { }

  ngOnInit() {
    this.loginOption = this.ticketService.ticketInformation.accountOption.existing;

    setTimeout(() => {
      if (this.firstnameElement)
        this.firstnameElement.nativeElement.focus();
    }, 10);
  }

  nextPage() {
    if (this.ticketService.ticketInformation.personalInformation.firstname &&
      this.ticketService.ticketInformation.personalInformation.lastname &&
      this.ticketService.ticketInformation.personalInformation.email &&
      this.ticketService.ticketInformation.personalInformation.phone) {
        //
        this.router.navigate(['destination']);
    }

    this.submitted = true;
  }

  prevPage() {
    this.ticketService.bookTrip = true;
    this.ticketService.initialCheck = false;
  }
}
