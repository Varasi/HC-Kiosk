import { Component, OnInit } from '@angular/core';

import { PrimeNGConfig } from 'primeng/api';

import { AppLayoutService } from './core/services';

import { GoogleAnalyticsService } from './core/services/google-analytics.service';
import { GoogleMapsApiService } from './core/services/google-maps-api.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    constructor(
        public layoutService: AppLayoutService,
        private primengConfig: PrimeNGConfig,
        private _gaService: GoogleAnalyticsService,
        private googleMapsAPI: GoogleMapsApiService
    ) { }

    ngOnInit() {
        this.primengConfig.ripple = true;
        this.layoutService.setDarkTheme();
        this._gaService.init();
        this.googleMapsAPI.loadGmapsScript();
    }
}
