import { Component, OnInit } from '@angular/core';

import { MessageService } from "primeng/api";
import { AppAuthService, AppLayoutService } from 'src/app/core/services';
import { IAuthData } from 'src/app/shared/models/auth-data.model';
import { LocalStorageItems } from 'src/app/shared/models/local-storage-items.model';

import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-login',
    templateUrl: './app.login.component.html',
    styleUrls: ['./app.login.component.scss']
})
export class AppLoginComponent implements OnInit {
    public appVersion: string = "";
    public error = true;
    public username = 'kiosk';
    public password: string;

    rememberMe: boolean = false;

    constructor(
        private messageService: MessageService,
        private authService: AppAuthService,
        private layoutService: AppLayoutService) { }

    public ngOnInit(): void {
        this.appVersion = `v. ${environment.version} - ${environment.release_date}`;

        if (localStorage.getItem(LocalStorageItems.authData))
            this.authService.loginFromLocalStorage();
    }

    get dark(): boolean {
        return this.layoutService.config.colorScheme !== 'light';
    }

    public fieldChanged(event: KeyboardEvent): void {
        if (event.key === 'Enter' && this.username && this.password) {
            this.login();
        }
    }

    public login(): boolean {
        let success = false;
        this.authService.tryToLoginAsync(this.username, this.password)
            .then((data: IAuthData) => {
                this.authService.setIsLogin(true);
                this.authService.addAuthenticationData(data);

                const hr = (new Date()).getHours(); // get hours of the day in 24Hr format (0-23)
                if (hr < 12) {
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance('Good Morning!'));
                } else if (12 <= hr && hr < 17) {
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance('Good Afternoon!'));
                } else {
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance('Hello!'));
                }
                success = true;
            })
            .catch((error: any) => {
                this.authService.setIsAuthenticated(false);
                this.messageService.add({ severity: 'error', summary: error.message, detail: "Please try again" });
            });
        return success;
    }
}
