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
import { signIn, fetchAuthSession, signOut } from '@aws-amplify/auth';
import { from } from 'rxjs';
import { jwtDecode } from "jwt-decode";

@Injectable()
export class AppAuthService {
    // private apiUrl = environment.api_url;

    public isAuthenticated = false;
    // public isLogin = false;

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
        console.log("gettoken func called")
        // return this.http.post(`${this.apiUrl}auth/login`, { username, password });

        // temporary solution
        // return of({
        //     token: 'zxsfsdfg56546grs546gsd54654tygetgsettd',
        //     displayName: 'dch'
        // });
        // temporary solution

        return from(
            signIn({ username, password }).then(async user => {
                const session = await fetchAuthSession();
                const tokenVal = session.tokens?.accessToken?.toString();
                const idTokenVal = session.tokens?.idToken?.toString();
                // const refreshTokenVal = session.tokens?.refreshToken?.toString() || null;
                const claims = idTokenVal ? JSON.parse(atob(idTokenVal.split('.')[1])) : {};
                console.log('Decoded ID token claims:', claims);
                this.setTokens(tokenVal,idTokenVal)
                return {
                    token: tokenVal,
                    idToken: idTokenVal,
                    // refreshToken: refreshTokenVal,
                    displayName: claims["cognito:username"] || claims["email"] || 'Unknown'
                };
            })
        );
    }

    public async tryToLoginAsync(username: string, password: string): Promise<any> {
        return await firstValueFrom(this.getToken(username, password));
    }

    // public async getChallenge() {
    //     let apiURL = 'localhost:5000'
    //     // return await fetch(`${this.apiUrl}/register`) 
    //     return fetch(`http://localhost:5000/challenge`, {method: "POST"}) 
    //     // return '11111111111111' 
    // }

    // public async getRegOptions(un: string) {//(user: string) {
    //     const resp = await fetch(`https://localhost:5000/register_options`, {
    //         method: "POST",
    //         headers: {
    //           'Accept': 'application/json',
    //           'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({username: un}),
    //     });
    //     const data = await resp.json();
    //     return data 
    // }

    // public getRegOptions(username) {//(user: string) {
    //     // console.log(username)
    //     return this.http.post(`http://localhost:5000/register_options`, {'username': username})
    // }

    // public sendKeys(the_keys) {//(user: string) {
    //     return this.http.post(`http://localhost:5000/verify`, the_keys)
    // }

    // public async userReg(user: string, challenge){
    //     const registration = await client.register({
    //       user: "Arnaud Dagnelies",
    //       challenge: btoa(challenge) //btoa("A server-side randomly generated string"),
    //     })  
    // }

    // public async userReg(reg_obj){
    //     const registration = await client.register(reg_obj);
    //     const resp = await fetch(`https://localhost:5000/verify`, {
    //         method: "POST",
    //         headers: {
    //           'Accept': 'application/json',
    //           'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(registration),
    //     });
    //     const data = await resp.json();
    //     return data 
    // }

    // logout() {
    //     this.removeAuthenticationData();
    // }

    // public setIsAuthenticated(isAuthenticated: boolean) {
    //     this.isAuthenticated = isAuthenticated;
    // };

    // public setIsLogin(isLogin: boolean) {
    //     this.isLogin = isLogin;
    // };

    // public loginFromLocalStorage() {
    //     // this.isLogin = true;
    //     this.restoreAuth();
    // }

    public addAuthenticationData(authData: IAuthData) {
        console.log("addAuthenticationData called")
        localStorage.setItem(LocalStorageItems.authData, JSON.stringify(authData));
        this.setAuth(authData.token);
        this.isAuthenticated = true;
        this.authChange.next(true);
        this.userStatus.next(authData.displayName);
        this.router.navigate(['/']);
        // if (this.isLogin) {
        //     this.router.navigate(['/']);
        // }
    }

    // public removeAuthenticationData() {
    //     localStorage.removeItem(LocalStorageItems.authData);

    //     this.options = new AppHttpOptions();
    //     this.isAuthenticated = false;
    //     this.isLogin = false;
    //     this.userStatus.next(null);
    //     this.authChange.next(false);
    //     this.router.navigate(['/login']);
    // }

    // go to lock/unlock screen page  - see lockscreen component
    public async lockScreen() {
        await signOut({global:false});
        localStorage.removeItem(LocalStorageItems.authData);
        this.options = new AppHttpOptions();
        this.isAuthenticated = false;
        this.authChange.next(false);
        this.userStatus.next(null);
        this.router.navigate(['/login']);
        // this.isLogin = false;
        // this.router.navigate(['/lockscreen']);
    }

    setAuth(token: string) {
        console.log("set auth func called")
        this.options = new AppHttpOptions();
        this.options.headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    }

    // restoreTokens() {
    //     const authData = localStorage.getItem(LocalStorageItems.authData);
    //     if (authData) {
    //         const parsed = JSON.parse(authData);
    //         this.setTokens(parsed.token, parsed.idToken);
    //         this.isAuthenticated = true;
    //     }
    // }

    public async restoreAuth(): Promise<void> {
        console.log("restore auth called")
        try{
            const session = await fetchAuthSession();
            const newAccessToken = session.tokens?.accessToken?.toString();
            const newIdToken = session.tokens?.idToken?.toString();
            const claims = newIdToken ? JSON.parse(atob(newIdToken.split('.')[1])) : {};
            const newdisplayName = claims["cognito:username"] || claims["email"] || 'Unknown'
            console.log('newAccessToken:',newAccessToken);
            console.log('newIdtoken:',newIdToken);
            console.log('displayName:',newdisplayName);
            if (!newAccessToken || !newIdToken || !newdisplayName){
                this.lockScreen();
                this.messageService.add({ severity: 'error', summary: "Session expired", detail: "Please log in again." });
            }else{
                this.isAuthenticated = true;
                const authData: IAuthData = {
                    token: newAccessToken,
                    idToken: newIdToken,
                    displayName: newdisplayName
                }
                this.addAuthenticationData(authData);
                this.setTokens(authData.token, authData.idToken);
            }
        } catch (error) {
            console.log("error while fetching user session:",error);
            this.lockScreen();
            this.messageService.add({ severity: 'error', summary: "Session expired", detail: "Please log in again." });

        }
        
        // const authData: IAuthData = JSON.parse(localStorage.getItem(LocalStorageItems.authData)!);

        // if (!authData) {
        //     this.isAuthenticated = false;
        //     this.router.navigate(['/login']);
        // } else {
        //     this.isAuthenticated = true;
        //     // this.setAuth(authData.token);
        //     this.addAuthenticationData(authData);
        //     // this.userStatus.next(authData.displayName);
        //     // this.authChange.next(true);
        //     this.setTokens(authData.token, authData.idToken);
        //     // this.restoreTokens();
        // }
    }

    // cognitoLogin() {
    //     window.location.href =
    //     `${environment.cognito_domain}/oauth2/authorize?response_type=token&client_id=${environment.cognito_client_id}&response_type=code&scope=email+openid&redirect_uri=${environment.baseUrl}static%2Fcognito.html`;
    // }

    setTokens(accessToken: string, idToken: string) {
        console.log("setTokens called")
        this.accessToken = accessToken;
        this.idToken = idToken;
    }

    // validates a JWT from AWS
    public async validateToken(verifyOnly: boolean = false) {
        console.log("validate token function called");
        console.log("idtoken:",this.idToken);
        let validated: boolean = false;
        
        // validate token
        // const verifier = CognitoJwtVerifier.create({
        //     userPoolId: environment.cognito_user_pool_id,
        //     tokenUse: environment.cognito_token_use as 'id' | 'access' | null,
        //     clientId: environment.cognito_client_id,
        // });

        try {
            const decoded: any = jwtDecode(this.idToken);
            const now = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp > now) {
                validated = true;
                if (!verifyOnly) {
                    this.isAuthenticated = true;
                    this.router.navigate(["/"]);
                }
            } else {
                throw new Error("Token expired");
            }
            // const payload = await verifier.verify(this.idToken)
            // validated = true;

            // if (!verifyOnly) {
            //     // confirm authentication and go to homepage
            //     this.isAuthenticated = true;
            //     this.router.navigate(["/"]);   
            // }
        } catch(err) {
            console.log("validated value:",validated)
            console.log("token not validated:",err);
            // this.messageService.add({ severity: 'error', summary: "Authentication error", detail: "Please use AWS Login to re-authenticate." });
            this.messageService.add({ severity: 'error', summary: "Authentication error", detail: "Please Login again to re-authenticate. Session Expired" });
        };

        return validated;   
    }
}
