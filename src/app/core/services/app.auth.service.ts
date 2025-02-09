import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, of, BehaviorSubject, firstValueFrom } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AppHttpOptions } from '../config';
import { IAuthData } from 'src/app/shared/models/auth-data.model';
import { LocalStorageItems } from 'src/app/shared/models/local-storage-items.model';
import { fetchAuthSession, signIn } from 'aws-amplify/auth';
import { defaultStorage } from 'aws-amplify/utils';

@Injectable()
export class AppAuthService {
    private apiUrl = environment.api_url;

    public isAuthenticated = false;
    private isLogin = false;

    private options: AppHttpOptions | undefined;
    public authChange = new BehaviorSubject<boolean>(false);
    public userStatus: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    constructor(
        private router: Router,
        public http: HttpClient) {
        //
        // this.restoreAuth();
    }

    public getOptions() {
        return this.options;
    }

    private  async getToken() {
        // return this.http.post(`${this.apiUrl}auth/login`, { username, password });

        // temporary solution
        const session = await fetchAuthSession();
        let response;
        if (session.tokens) {          
            const clientId = session.tokens?.accessToken.payload['client_id']; 
            const storage= defaultStorage.storage;
            const username=storage?.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`)          
            const idToken=defaultStorage.storage?.getItem(`CognitoIdentityServiceProvider.${clientId}.${username}.idToken`);
            // console.log(idToken);
            response = {
                token: idToken,
                displayName: 'kiosk'
            };

        }
        // return of({
        //     token: 'zxsfsdfg56546grs546gsd54654tygetgsettd',
        //     displayName: 'kiosk'
        // });
        return response;
        // temporary solution
    }

    public async tryToLoginAsync(username: string, password: string): Promise<any> {
        
        try{
             const {nextStep}=await signIn({username,password});
             const sesssion=await fetchAuthSession();
             return this.getToken();
        }
        catch (error)
        {
            return error
        }
          
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
}
