import { Component, OnInit } from '@angular/core';

import { PrimeNGConfig } from 'primeng/api';

import { AppLayoutService } from './core/services';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    constructor(
        public layoutService: AppLayoutService,
        private primengConfig: PrimeNGConfig) { }

    ngOnInit() {
        this.primengConfig.ripple = true;
        this.layoutService.setDarkTheme();
    }
}
