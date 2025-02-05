import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, of, BehaviorSubject, firstValueFrom } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AppHttpOptions } from '../config';
import { IAuthData } from 'src/app/shared/models/auth-data.model';
import { LocalStorageItems } from 'src/app/shared/models/local-storage-items.model';

import { client } from '@passwordless-id/webauthn' 
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { MessageService } from 'primeng/api';

@Injectable()
export class AppAuthService {
    private apiUrl = environment.api_url;

    public isAuthenticated = false;
    public isLogin = false;

    private options: AppHttpOptions | undefined;
    public authChange = new BehaviorSubject<boolean>(false);
    public userStatus: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    accessToken: string;
    idToken: string;

    constructor(
        public router: Router,
        public http: HttpClient,
        private messageService: MessageService) {
        this.restoreAuth();
    }

    public getOptions() {
        return this.options;
    }

    private getToken(username: string, password: string): Observable<any> {
        // return this.http.post(`${this.apiUrl}auth/login`, { username, password });

        // temporary solution
        return of({
            token: 'zxsfsdfg56546grs546gsd54654tygetgsettd',
            displayName: 'dch'
        });
        // temporary solution
    }

    public async tryToLoginAsync(username: string, password: string): Promise<any> {
        return await firstValueFrom(this.getToken(username, password));
    }

    public async getChallenge() {
        let apiURL = 'localhost:5000'
        // return await fetch(`${this.apiUrl}/register`) 
        return fetch(`http://localhost:5000/challenge`, {method: "POST"}) 
        // return '11111111111111' 
    }

    public async getRegOptions(un: string) {//(user: string) {
        const resp = await fetch(`https://localhost:5000/register_options`, {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: un}),
        });
        const data = await resp.json();
        return data 
    }

    // public getRegOptions(username) {//(user: string) {
    //     // console.log(username)
    //     return this.http.post(`http://localhost:5000/register_options`, {'username': username})
    // }

    public sendKeys(the_keys) {//(user: string) {
        return this.http.post(`http://localhost:5000/verify`, the_keys)
    }

    // public async userReg(user: string, challenge){
    //     const registration = await client.register({
    //       user: "Arnaud Dagnelies",
    //       challenge: btoa(challenge) //btoa("A server-side randomly generated string"),
    //     })  
    // }

    public async userReg(reg_obj){
        const registration = await client.register(reg_obj);
        const resp = await fetch(`https://localhost:5000/verify`, {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(registration),
        });
        const data = await resp.json();
        return data 
    }

    logout() {
        this.removeAuthenticationData();
    }

    public setIsAuthenticated(isAuthenticated: boolean) {
        this.isAuthenticated = isAuthenticated;
    };

    public setIsLogin(isLogin: boolean) {
        this.isLogin = isLogin;
    };

    public loginFromLocalStorage() {
        this.isLogin = true;
        this.restoreAuth();
    }

    public addAuthenticationData(authData: IAuthData) {
        localStorage.setItem(LocalStorageItems.authData, JSON.stringify(authData));
        this.setAuth(authData.token);

        this.isAuthenticated = true;

        this.authChange.next(true);
        this.userStatus.next(authData.displayName);

        if (this.isLogin) {
            this.router.navigate(['/']);
        }
    }

    public removeAuthenticationData() {
        localStorage.removeItem(LocalStorageItems.authData);

        this.options = new AppHttpOptions();
        this.isAuthenticated = false;
        this.userStatus.next(null);
        this.router.navigate(['/login']);
    }

    // go to lock/unlock screen page  - see lockscreen component
    public lockScreen() {
        localStorage.removeItem(LocalStorageItems.authData);

        this.options = new AppHttpOptions();
        this.isAuthenticated = false;
        this.userStatus.next(null);
        this.router.navigate(['/lockscreen']);
    }

    setAuth(token: string) {
        this.options = new AppHttpOptions();
        this.options.headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    }

    private restoreAuth(): void {
        const authData: IAuthData = JSON.parse(localStorage.getItem(LocalStorageItems.authData)!);

        if (!authData) {
            this.isAuthenticated = false;
            this.router.navigate(['/login']);
        } else {
            this.isAuthenticated = true;
            this.setAuth(authData.token);
            this.addAuthenticationData(authData);
            this.userStatus.next(authData.displayName);
            this.authChange.next(true);
        }
    }

    cognitoLogin() {
        window.location.href =
        `${environment.cognito_domain}/oauth2/authorize?response_type=token&client_id=${environment.cognito_client_id}&response_type=code&scope=email+openid&redirect_uri=${environment.baseUrl}static%2Fcognito.html`;
    }

    setTokens(accessToken: string, idToken: string) {
        this.accessToken = accessToken;
        this.idToken = idToken;
    }

    // validates a JWT from AWS
    public async validateToken(verifyOnly: boolean = false) {
        let validated: boolean = false;
        
        // validate token
        const verifier = CognitoJwtVerifier.create({
            userPoolId: environment.cognito_user_pool_id,
            tokenUse: environment.cognito_token_use as 'id' | 'access' | null,
            clientId: environment.cognito_client_id,
        });

        try {
            const payload = await verifier.verify(this.idToken)
            validated = true;

            if (!verifyOnly) {
                // confirm authentication and go to homepage
                this.isAuthenticated = true;
                this.router.navigate(["/"]);   
            }
        } catch {
            this.messageService.add({ severity: 'error', summary: "Authentication error", detail: "Please use AWS Login to re-authenticate." });
        };

        return validated;   
    }
}
