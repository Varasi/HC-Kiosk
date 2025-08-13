import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { MenuItem } from 'primeng/api';

import { AppLayoutService, TicketService, AppAuthService } from '../../core/services';
import { TimeoutService } from 'src/app/core/services/timeout.service';
import { TranslateService } from '@ngx-translate/core';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AppSpeechService } from 'src/app/core/services/app.speech.service';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss']
})
export class AppTopBarComponent {
    items!: MenuItem[];
    currentLang = 'en';

    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(
        public layoutService: AppLayoutService, 
        public ticketService: TicketService,
        public authService: AppAuthService,
        private router: Router,
        public timeoutService: TimeoutService,
        private translate: TranslateService,
        private speechService: AppSpeechService
    ) { 
        translate.addLangs(['en', 'es']);
        translate.use(this.currentLang);
        // this.currentLang = this.layoutService.language;
    }
    
    toggleLanguage() {
        // this.currentLang = this.currentLang === 'en' ? 'es' : 'en';
        // this.layoutService.changeLanguage(this.currentLang);
        // this.translate.use(this.layoutService.language);
        if (this.layoutService.language === 'es') {
            this.layoutService.changeLanguage('en');
            this.translate.use(this.layoutService.language);
            if (this.layoutService.audio){
                this.speechService.speak('Language set to English');
            }
            
        }else{
            this.layoutService.changeLanguage('es');
            this.translate.use(this.layoutService.language);
            if (this.layoutService.audio){
                this.speechService.speak('Idioma establecido en español');
            }
            
        }
    }
    toggleDarkMode() {
        this.layoutService.dark = !this.layoutService.dark;

        if (this.layoutService.dark) {
            this.layoutService.changeTheme('dark');
            if (this.layoutService.audio){
                this.speechService.speak(this.translate.instant('Switching to dark mode'));
            }
        } else {
            this.layoutService.changeTheme('light');
            if (this.layoutService.audio){
                this.speechService.speak(this.translate.instant('Switching to light mode'));
            }
        }
    }

    toggleAudioMode() {
        this.layoutService.audio = !this.layoutService.audio;
        this.layoutService.changeAudio(this.layoutService.audio);

        if (this.layoutService.audio) {
            this.speechService.speak(this.translate.instant('Switching audio on'));
        } else {
            this.speechService.speak(this.translate.instant('Switching audio off'));
        }
    }

    onStartOver() {
        // clear any active intervals or timeoutes
        this.timeoutService.clearAllTimers();

        if(this.layoutService.audio) {
            this.speechService.speak(this.translate.instant('Starting over'));
        }

        this.ticketService.bookTrip = true;
        this.ticketService.initialCheck = false;
    }

    lockScreen() {
        this.authService.lockScreen();
    }
}
