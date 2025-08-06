import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { MenuItem } from 'primeng/api';

import { AppLayoutService, TicketService, AppAuthService } from '../../core/services';
import { TimeoutService } from 'src/app/core/services/timeout.service';
import { TranslateService } from '@ngx-translate/core';
import { InputSwitchModule } from 'primeng/inputswitch';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss']
})
export class AppTopBarComponent {
    items!: MenuItem[];
    currentLang = 'en';
    checked = false;

    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(
        public layoutService: AppLayoutService, 
        public ticketService: TicketService,
        public authService: AppAuthService,
        private router: Router,
        public timeoutService: TimeoutService,
        private translate: TranslateService
    ) { 
        translate.addLangs(['en', 'es']);
        translate.use(this.currentLang);
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'es' : 'en';
        this.translate.use(this.currentLang);
        this.checked = !this.checked;
    }
    toggleDarkMode() {
        this.layoutService.dark = !this.layoutService.dark;

        if (this.layoutService.dark) {
            this.layoutService.changeTheme('dark');
            if (this.layoutService.audio)
                window.speechSynthesis.speak(new SpeechSynthesisUtterance('Switching to dark mode'));
        } else {
            this.layoutService.changeTheme('light');
            if (this.layoutService.audio)
                window.speechSynthesis.speak(new SpeechSynthesisUtterance('Switching to light mode'));
        }
    }

    toggleAudioMode() {
        this.layoutService.audio = !this.layoutService.audio;
        this.layoutService.changeAudio(this.layoutService.audio);

        if (this.layoutService.audio) {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance('Switching audio on'));
        } else {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance('Switching audio off'));
        }
    }

    onStartOver() {
        // clear any active intervals or timeoutes
        this.timeoutService.clearAllTimers();

        if(this.layoutService.audio) {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance('Starting over'));
        }

        this.ticketService.bookTrip = true;
        this.ticketService.initialCheck = false;
    }

    lockScreen() {
        this.authService.lockScreen();
    }
}
