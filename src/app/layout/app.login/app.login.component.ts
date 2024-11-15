import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Toast, ToastModule } from 'primeng/toast';
import { AppLayoutService } from '../../core/services/app.layout.service';
import { NgxTouchKeyboardModule } from 'ngx-touch-keyboard';
import { AppAuthService } from '../../core/services/app.auth.service';
import { IAuthData } from '../../shared/models';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../toast.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ToastComponent,FormsModule,ButtonModule,CommonModule,ToastModule,NgxTouchKeyboardModule],
    providers:[MessageService,AppAuthService,ToastService],
    templateUrl: './app.login.component.html',
    styleUrl: './app.login.component.scss'
})
export class AppLoginComponent {
    public appVersion: string = "";
    public error = true;
    public username = '';
    public password : string= '';


    rememberMe: boolean = false;

    constructor(
        private messageService: MessageService,
        private authService: AppAuthService,
        private layoutService: AppLayoutService,
        public toastService:ToastService,
        private router: Router) { }

    public ngOnInit(): void {
     
        //this.appVersion = `v. ${environment.version} - ${environment.release_date}`;

        // if (localStorage.getItem(LocalStorageItems.authData))
        //     this.authService.loginFromLocalStorage();
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
        //this.router.navigate(['/app-layout']);
        this.authService.tryToLoginAsync(this.username, this.password)
            .then((data: IAuthData) => {
                if(data.token){
                this.authService.setIsLogin(true);
                const hr = (new Date()).getHours(); // get hours of the day in 24Hr format (0-23)
                if (hr < 12) {
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance('Good Morning!'));
                } else if (12 <= hr && hr < 17) {
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance('Good Afternoon!'));
                } else {
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance('Hello!'));
                }
                success = true;
                this.router.navigate(['/app-layout']);
                
            }
            else{
                //  alert(`Wrong UserName and Password`)
                 this.toastService.showToast('Wrong UserName Or Password', 'error');
                 this.authService.setIsLogin(false);
                //   this.authService.setIsLogin(false);
                 success = false;
            }
    })
            .catch((error: any) => {
                this.authService.setIsAuthenticated(false);
                this.authService.setIsLogin(false);
                // this.messageService.add({ severity: 'error', summary: error.message, detail: "Please try again" });
                this.toastService.showToast('Please try again   '+error.message+ 'error');
                success = false;
            });
        return success;
    }
}
