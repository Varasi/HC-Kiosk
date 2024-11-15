// import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { Component, NgModule } from '@angular/core';
import { Amplify} from 'aws-amplify';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';
import { CommonModule } from '@angular/common';
import awsmobile from '../aws-exports';
import { ToastComponent } from './toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ToastComponent,RouterOutlet,FormsModule,ToastModule,AmplifyAuthenticatorModule,CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title="kiosk";
  constructor(public authenticator: AuthenticatorService) {
    Amplify.configure(awsmobile);
}
}
