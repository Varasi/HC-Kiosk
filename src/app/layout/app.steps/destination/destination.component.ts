import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from 'src/environments/environment';
import { AppDataService, TicketService } from 'src/app/core/services';

declare var google: any;

@Component({
  selector: 'app-destination',
  templateUrl: './destination.component.html',
  styleUrls: ['./destination.component.scss']
})
export class DestinationComponent implements OnInit {
  @ViewChild('destination') destinationElement: ElementRef;

  trip_origin = environment.trip_origin;

  addPassengerBtn = true;
  passengerLimit = false;
  booking = false;

  constructor(
    public ticketService: TicketService,
    protected dataService: AppDataService,
    private router: Router) { }

  ngAfterViewInit() {
    const input = document.getElementById('pac-input');
    (<HTMLInputElement>input).value = '';

    const southwest = { 
      lat: environment.southwestLat,
      lng: environment.southwestLng
    };      
    const northeast = { 
      lat: environment.northeastLat,
      lng: environment.northeastLng
    };    
    const defaultBounds = new google.maps.LatLngBounds(southwest, northeast);
    const options = {
      bounds: defaultBounds,
      componentRestrictions: { country: "us" },
      fields: ["formatted_address", "geometry"],
      strictBounds: true
    };
    const autocomplete = new google.maps.places.Autocomplete(input, options);
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      if (place && place.geometry) {
        this.ticketService.ticketInformation.destination.lat = place.geometry.location.lat();
        this.ticketService.ticketInformation.destination.lng = place.geometry.location.lng();
        this.ticketService.ticketInformation.destination.address = place.formatted_address;
      }
    });
  }

  ngOnInit() {
    setTimeout(() => {
      if (this.destinationElement)
        this.destinationElement.nativeElement.focus();
    }, 10);
  }

  destComplete() {
    let payload = this.ticketService.getTripRequestPayload();
    this.booking = true;

    this.dataService.getAuthToken().subscribe({
      next: (token: any) => {
        this.dataService.bookKioskTrip(payload, token.access_token).subscribe({
          next: (trip_data: any) => {
            if (Array.isArray(trip_data)) {
              let errorInfo = JSON.parse(trip_data[0].replace('MOD/ATMS Error:', ''));
              if (errorInfo.info) {
                if (errorInfo.message === 'NoSuchRiderError'){
                  this.ticketService.destinationError(`You are not currently enrolled in Health Connector service. Please call (877) 686-0029 or see the front desk to register.`);
                } else if(errorInfo.message === 'DestinationOutOfZone') {
                  this.ticketService.destinationError(`Destination out of service area.`);
                } else {
                  this.ticketService.destinationError(errorInfo.info);
                }
              } else if (errorInfo.message.includes('DoubleBooking')) {
                this.ticketService.destinationError(`You've already scheduled a trip. Go to 'Check a previously booked trip' to see where your ride is.`);
              } else {
                this.ticketService.destinationError('Error booking the trip! Please try again later!');
              }
            } else {
              const trip_id = trip_data.trip_id;
              this.dataService.bookKioskTripDetails(trip_id, token.access_token).subscribe({
                next: (trip_data_details: any) => {
                  if (Array.isArray(trip_data_details)) {
                    let errorInfo = JSON.parse(trip_data_details[0].replace('MOD/ATMS Error:', ''));
                    if (errorInfo.info) {
                      if (errorInfo.message === 'NoSuchRiderError'){
                        this.ticketService.destinationError(`You are not currently enrolled in Health Connector service. Please call (877) 686-0029 or see the front desk to register.`);
                      } else if(errorInfo.message === 'DestinationOutOfZone') {
                        this.ticketService.destinationError(`Destination out of service area.`);
                      } else {
                        this.ticketService.destinationError(errorInfo.info);
                      }
                    } else if (errorInfo.message.includes('DoubleBooking')) {
                      this.ticketService.destinationError(`You've already scheduled a trip. Go to 'Check a previously booked trip' to see where your ride is.`);
                    } else {
                      this.ticketService.destinationError('Error booking the trip! Please try again later!');
                    }
                  } else {
                    this.ticketService.destinationComplete(trip_data_details.trip_details); 
                    this.router.navigate(['pickup']);
                  }
                }, error: () => {
                  this.ticketService.destinationError('Error booking the trip - communication error!');
                }
              });
            }
            this.booking = false;
          }, error: () => {
            this.booking = false;
            this.ticketService.destinationError('Error booking the trip! Please try again later!');
          }
        });
      }, error: () => {
        this.ticketService.destinationError('Error booking the trip - communication error!');
      }
    });
  }

  prevPage() {
    this.router.navigate(['account-book-trip']);
  }
}
