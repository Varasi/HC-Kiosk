import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { from, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AppHttpOptions } from '../config';
import { IRiderDetails, ITripRequestData } from 'src/app/shared/models';
import { AppAuthService } from './app.auth.service';

@Injectable()
export class AppDataService {
  protected apiUrl = environment.api_url;
  // protected client_id = environment.client_id;
  // protected client_secret = environment.client_secret;

  constructor(protected http: HttpClient,public authservice:AppAuthService) {
    
   }

  public getAuthToken(): Observable<any> {
    // const body = new HttpParams()
    //   .set('client_id', this.client_id)
    //   .set('client_secret', this.client_secret)
    //   .set('grant_type', 'client_credentials');

    // return this.http.post<any>(`${this.apiUrl}oauth2/token/`, body.toString(), 
    //   { headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded') }
    // );
    const tokenPromise = this.authservice.getToken(); // `getToken` returns a Promise
    return from(tokenPromise);
  }

  public bookKioskTrip(payload: ITripRequestData, token: string) {
    let options = new AppHttpOptions();
    options.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token);
    return this.http.post(`${this.apiUrl}kiosk_request`, payload, options);
  }

  public bookKioskTripDetails(trip_id: string, token: string) {
    let options = new AppHttpOptions();
    options.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token);

    return this.http.post(`${this.apiUrl}kiosk_request_detail`, {"trip_id": trip_id}, options);
  }

  public checkAPreviouslyKioskBookedTrip(payload: IRiderDetails, token: string) {
    let options = new AppHttpOptions();
    options.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token);

    return this.http.post(`${this.apiUrl}connector_status`, payload, options);
  }
}
