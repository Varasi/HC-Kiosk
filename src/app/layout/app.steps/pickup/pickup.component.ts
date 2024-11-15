import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IDriverInfo, IResponseAddress, ITripDetails, ITripResponseDetails, IVehicleInfo } from '../../../shared/models';
import { AppLayoutService } from '../../../core/services/app.layout.service';
import { TicketService } from '../../../core/services/app.ticketservice.service';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AppDataService } from '../../../core/services/app.data.service';

@Component({
  selector: 'pickup',
  standalone: true,
  imports: [CommonModule,CardModule,ButtonModule],
  templateUrl: './pickup.component.html',
  styleUrl: './pickup.component.scss'
})
export class PickupComponent {
  private tripResponse = <ITripResponseDetails>{};
  private tripDetails = <ITripDetails>{};

  vehicleInfo = <IVehicleInfo>{};
  driverInfo = <IDriverInfo>{};
  pickupAddress = <IResponseAddress>{};
  estimatedTime: string='';

  constructor(public layoutService: AppLayoutService,
    private ticketService: TicketService,
    private router: Router) {
    if (!this.ticketService.bookTrip) {
      this.tripDetails = this.ticketService.tripDetails;
      this.vehicleInfo = this.ticketService.tripDetails.vehicle_info;
      this.driverInfo = this.ticketService.tripDetails.driver_info;
      this.pickupAddress = this.tripDetails.pickup as IResponseAddress;
      this.estimatedTime = this.ticketService.estimateTime(this.tripDetails.pickup_eta);

    } else {
  
      this.tripDetails = <ITripDetails>{};
      this.vehicleInfo = <IVehicleInfo>{};
      this.driverInfo = <IDriverInfo>{};
      this.tripResponse = ticketService.tripResponse;
      this.tripDetails = ticketService.tripDetails;
      this.vehicleInfo = ticketService.tripResponse.vehicle_info;//**change
      this.driverInfo = ticketService.tripResponse.driver_info;//**change
      this.pickupAddress = this.ticketService.tripResponse.pickup as IResponseAddress;//**change
      this.estimatedTime = this.ticketService.estimateTime(ticketService.tripResponse.pickup_eta);
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
