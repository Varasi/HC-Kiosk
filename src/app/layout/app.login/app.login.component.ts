import { Component, OnInit } from '@angular/core';

import { MessageService } from "primeng/api";
import { AppAuthService, AppLayoutService } from 'src/app/core/services';
import { IAuthData } from 'src/app/shared/models/auth-data.model';
import { LocalStorageItems } from 'src/app/shared/models/local-storage-items.model';

import { environment } from 'src/environments/environment';

import {client} from '@passwordless-id/webauthn'
import { CognitoCallbackComponent } from "src/app/cognito-callback/cognito-callback.component";

@Component({
    selector: 'app-login',
    templateUrl: './app.login.component.html',
    styleUrls: ['./app.login.component.scss']
})
export class AppLoginComponent implements OnInit {
    public appVersion: string = "";
    public error = true;
    public username = 'dch';
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

    /* 
        Redirects to cognito login page where the user enters username and pw.
        Successful login redirects to /src/static/cognito.html, which redirects
        to the cognito-login component page, with the JWT from AWS. The JWT is
        stored and cognito-callback component and verfied in the auth service.
    */
    public cognitoLogin() {
        this.authService.cognitoLogin();
    }

    public hwlogin() {
        return 0;
    }

    public register() {
        // let challenge = this.authService.getRegOptions(
        //     'Arnaud Dagnelies'
        //     ).subscribe(
        //         reg_obj =>
        //             this.authService.userReg(reg_obj)
        //     )
        // this.authService.sendKeys(challenge).subscribe()
        
        this.authService.getRegOptions('Arnaud Dagnelies'
        ).then(
            challenge => this.authService.userReg(challenge)
        )
    }
}
