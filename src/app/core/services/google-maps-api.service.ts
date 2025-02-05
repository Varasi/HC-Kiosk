import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsApiService {

  constructor() { }

  // uses DOM manipulation to place the scripts that were previously written 
  // in index.html, so that the API key can be kept locally in the env file
  public loadGmapsScript()  {
    // add the initMap function to thehtml body
    const initMapScript = document.createElement('script');
    initMapScript.innerHTML = 'function initMap() { }';
    document.body.appendChild(initMapScript);

    // add the Maps API bootstrap URL script to the html body
    const urlScript = document.createElement('script');
    urlScript.src = `https://maps.googleapis.com/maps/api/js?key=${environment.google_maps_api_key}&loading=async&libraries=places&callback=initMap`;
    urlScript.async = true;
    document.body.appendChild(urlScript);

    // add the window.google object script to the html body
    const windowGoogleScript = document.createElement('script');
    windowGoogleScript.innerHTML = 'const google = window.google = window.google ? window.google : {}';
    document.body.appendChild(windowGoogleScript);
  }
}
