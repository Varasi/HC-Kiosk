import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { 
  IDriverInfo, 
  IResponseAddress, 
  ITripDetails, 
  ITripResponseDetails, 
  IVehicleInfo } from 'src/app/shared/models';
import { AppLayoutService, TicketService } from 'src/app/core/services';

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

  constructor(public layoutService: AppLayoutService,
    public ticketService: TicketService,
    private router: Router) {
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

  done() {
    if (this.layoutService.audio)
      window.speechSynthesis.speak(new SpeechSynthesisUtterance('Thank you for booking your trip with us. Have a great day!'));

    this.ticketService.bookTrip = true;
    this.ticketService.initialCheck = false;
  }

  prevPage() {
    if (this.ticketService.bookTrip) {
      this.router.navigate(['destination']);
    } else {
      this.router.navigate(['account-check-trip']);
    }
  }
}
