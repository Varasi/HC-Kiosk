import { Injectable } from '@angular/core';
import { AppLayoutService } from './app.layout.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class AppSpeechService {
    constructor(
        private layoutService: AppLayoutService,
        private translate: TranslateService
    ) { }
    speak(message: string) {
        window.speechSynthesis.cancel();
        const messageUtterance = new SpeechSynthesisUtterance(message);
        messageUtterance.lang = this.layoutService.language === 'es' ? 'es-ES' : 'en-US';
        window.speechSynthesis.speak(messageUtterance);
    }
}
