import { Component, OnInit } from '@angular/core';

import { PrimeNGConfig } from 'primeng/api';

import { AppLayoutService } from './core/services';
import awsmobile from './core/config/aws-export';
import { Amplify } from 'aws-amplify';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    constructor(
        public layoutService: AppLayoutService,
        private primengConfig: PrimeNGConfig) { 
            Amplify.configure(awsmobile);
        }

    ngOnInit() {
        this.primengConfig.ripple = true;
        this.layoutService.setDarkTheme();
    }
}
