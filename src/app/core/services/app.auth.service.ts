import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { fetchAuthSession, signIn, signOut } from 'aws-amplify/auth'
import { Observable, of, BehaviorSubject, firstValueFrom } from 'rxjs';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { environment } from '../../../environments/environment';
import { AppHttpOptions } from '../config';
import { IAuthData } from '../../shared/models/auth-data.model';
import { LocalStorageItems } from '../../shared/models/local-storage-items.model';
// import { ToastService } from 'primeng/toast';

@Injectable({ providedIn: 'root' })
export class AppAuthService {
    private apiUrl = environment.api_url;

    public isAuthenticated = false;
    //** change form private to public */
    private isLogin = false;

    private options: AppHttpOptions | undefined;
    public authChange = new BehaviorSubject<boolean>(false);
    public userStatus: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    // constructor(public authService: AppAuthService) {}
    constructor(
        private router: Router,
        public http: HttpClient) {
        //
        this.restoreAuth();
    }

    public getOptions() {
        return this.options;
    }

    public async getToken() {
        // temporary solution
        //changed **
        const session = await fetchAuthSession();
        let response;
        if (session.tokens) {
            const idToken = session.tokens.idToken; // ID token
            const accessToken = session.tokens.accessToken;

            response = {
                token_type: 'Bearer',
                id_token: idToken,
                access_token: accessToken,

            };

        }
        return response;

    }

    public async tryToLoginAsync(username: string, password: string): Promise<any> {
        // changes made **
        try {
            signOut();
            const { nextStep } = await signIn({ username, password });
            const session = await fetchAuthSession();

            if (session.tokens) {
                const idToken1 = session.tokens.idToken; // ID token

                const accessToken = session.tokens.accessToken;
                let username, client_id;
                if (accessToken.payload) {
                    username = accessToken.payload['username'];
                    client_id = accessToken.payload['client_id'];
                }

                // Decode token for user group info
                const groups = accessToken.payload["cognito:groups"];
                // const groups=["KioskUser"];
                if (groups && Array.isArray(groups) && groups.includes("KioskUser")) {
                    // Return token and displayName if user is authenticated and belongs to KioskUser group
                    return {
                        token: accessToken,
                        displayName: 'kiosk'
                    };
                } else {
                    // User is not in KioskUser group; return an error message
                    return {
                        token: null,
                        message: "Wrong username or password"
                    };
                }
            }
        } catch (error) {

            return { token: null, message: error || "An error occurred" };
        }

    }

    logout() {
        signOut();
        this.removeAuthenticationData();

    }

    public setIsAuthenticated(isAuthenticated: boolean) {
        this.isAuthenticated = isAuthenticated;
    };

    public setIsLogin(isLogin: boolean) {
        this.isLogin = isLogin;
    };
    //changed **
    public async getIsLogin() {
        const session = await fetchAuthSession();
        if (session.tokens) {
            const idToken = session.tokens.idToken; // I
            if (idToken)
                return true;
        }
        return false;
        // return this.isLogin;
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
