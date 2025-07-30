import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ITripDetails, ITripRequestData, ITripResponse, ITripInfo, ITripResponseDetails } from 'src/app/shared/models';

@Injectable()
export class TicketService {
    ticketInformation: ITripInfo = {
        accountOption: {
            existing: true
        },
        personalInformation: {
            firstname: '',
            lastname: '',
            email: '',
            phone: ''
        },
        destination: {
            lat: 0,
            lng: 0,
            address_text: '',
            address: '',
            notes: ''
        },
        passengers: [
            { type: 'Guest', total: 0, max: 2 },
            { type: 'Guest (WAV)', total: 0, max: 1 },
            { type: 'PCA', total: 0, max: 1 },
            { type: 'PCA (WAV)', total: 0, max: 1 }
        ]
    };

    tripResponse: ITripResponseDetails;
    tripDetails: ITripDetails;

    protected hirta_via_account_name = environment.hirta_via_account_name;
    protected kioskLat = environment.kiosk_lat;
    protected kioskLng = environment.kiosk_lng;
    protected kioskAddress = environment.kiosk_address;

    bookTrip: boolean = true;
    initialCheck: boolean = false;

    private bookingComplete = new Subject<any>();
    bookingComplete$ = this.bookingComplete.asObservable();

    private bookingError = new Subject<any>();
    bookingError$ = this.bookingError.asObservable();

    private tripCheckComplete = new Subject<any>();
    tripCheckComplete$ = this.tripCheckComplete.asObservable();

    private tripCheckError = new Subject<any>();
    tripCheckError$ = this.tripCheckError.asObservable();

    public getTripRequestPayload(): ITripRequestData {
        let additionalPassengers = {};
        let totalPassengers = 1;
        this.ticketInformation.passengers.forEach(passenger => {
            if (passenger.total > 0) {
                additionalPassengers[passenger.type] = passenger.total;
                totalPassengers += passenger.total;
            }
        });

        let payload: ITripRequestData = {
            additional_passengers: additionalPassengers,
            depart_at: (Date.now() / 1000) + 15 * 60, // 15 minutes from now
            destination: {
                lat: this.ticketInformation.destination.lat.toString(),
                lng: this.ticketInformation.destination.lng.toString(),
                address: this.ticketInformation.destination.address,
                notes: this.ticketInformation.destination.notes
            },
            origin: {
                lat: environment.kiosk_lat,
                lng: environment.kiosk_lng,
                address: environment.kiosk_address
            },
            passenger_count: totalPassengers,
            // sub_service: this.hirta_via_account_name,
            passenger_info: {
                first_name: this.ticketInformation.personalInformation.firstname,
                last_name: this.ticketInformation.personalInformation.lastname,
                phone_number: `+1${this.ticketInformation.personalInformation.phone}`,
                email: this.ticketInformation.personalInformation.email
            }
        };

        return payload;
    }

    destinationComplete(tripResponse: ITripResponseDetails) {
        this.tripResponse = tripResponse;
        this.ticketInformation.personalInformation['estimatedTime'] = this.estimateTime(tripResponse.pickup_eta);
        this.bookingComplete.next(this.ticketInformation.personalInformation);
    }

    destinationError(error: string) {
        this.tripResponse = null;
        this.bookingError.next(error);
    }

    checkComplete(tripDetails: ITripDetails) {
        this.tripDetails = tripDetails;
        this.ticketInformation.personalInformation['estimatedTime'] = this.estimateTime(tripDetails.pickup_eta);
        this.tripCheckComplete.next(this.ticketInformation.personalInformation);
    }

    checkError(error: string) {
        this.tripDetails = null;
        this.tripCheckError.next(error);
    }

    reset() {
        this.ticketInformation = {
            accountOption: {
                existing: true
            },
            personalInformation: {
                firstname: '',
                lastname: '',
                email: '',
                phone: ''
            },
            destination: {
                lat: 0,
                lng: 0,
                address_text: '',
                address: '',
                notes: ''
            },
            passengers: [
                { type: 'Guest', total: 0, max: 2 },
                { type: 'Guest (WAV)', total: 0, max: 1 },
                { type: 'PCA', total: 0, max: 1 },
                { type: 'PCA (WAV)', total: 0, max: 1 }
            ]
        };
    }

    estimateTime(eta: number): string {
        var d = new Date();
        
        var now = Math.floor(d.getTime() / 1000); 
        // getTime() returns milliseconds, and we need seconds, hence the Math.floor and division by 1000

        var seconds = eta - now;
        let days = Math.floor(seconds / (24 * 3600));

        if (days >= 2)
            return `${days} days from now`;

        if (days === 1)
            return 'tomorrow';

        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds - hours * 3600) / 60);

        let hoursInfo = hours === 1 ? 'hour' : 'hours';
        let minutesInfo = minutes === 1 ? 'minute' : 'minutes';

        if (hours === 1)
            return `${hours} ${hoursInfo} and ${minutes} ${minutesInfo}`;

        if (hours > 0)
            return `${hours} ${hoursInfo} and ${minutes} ${minutesInfo}`;

        if (minutes > 0)
            return `${minutes} ${minutesInfo}`;

        return 'n/a';
    }
}