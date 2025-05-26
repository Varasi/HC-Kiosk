import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AppAuthService } from 'src/app/core/services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-lockscreen',
  templateUrl: './lockscreen.component.html',
  styleUrls: ['./lockscreen.component.scss']
})
export class LockscreenComponent {
  constructor(
    private authService: AppAuthService,
    private messageService: MessageService
  ) { }

  passwordInput: string;
  password: string = environment.lock_screen_password;
  awsLoginDisabled: boolean = true;

  // if input pw is correct, login after verifying AWS JWT
  public login() {
    if (this.passwordInput === this.password) {
      if (!this.authService.validateToken()) {
        // enable AWS LOGIN button if verification fails
        this.awsLoginDisabled = false;
      }
    }
    else {
        this.messageService.add({ severity: 'error', summary: "Incorrect password", detail: "Please try again." });
    }
  }

  public cognitoLogin() {
    this.authService.cognitoLogin();
  }
}
