import { RouterModule, mapToCanActivate } from '@angular/router';
import { NgModule } from '@angular/core';

import { AppAuthGuard } from './core/guards';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { AccountBookTripComponent } from './layout/app.steps/account-book-trip/account-book-trip.component';
import { DestinationComponent } from './layout/app.steps/destination/destination.component';
import { PickupComponent } from './layout/app.steps/pickup/pickup.component';
import { AccountCheckTripComponent } from './layout/app.steps/account-check-trip/account-check-trip.component';
import { AppLoginComponent } from './layout/app.login/app.login.component';
import { CognitoCallbackComponent } from './cognito-callback/cognito-callback.component';
import { LockscreenComponent } from './layout/lockscreen/lockscreen.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppLayoutComponent, canActivate: 
                mapToCanActivate([AppAuthGuard]), canLoad: [AppAuthGuard],
                children: [
                    { path: 'account-book-trip', component: AccountBookTripComponent },
                    { path: 'destination', component: DestinationComponent },
                    { path: 'pickup', component: PickupComponent },
                    { path: 'account-check-trip', component: AccountCheckTripComponent },
                ]
            },
            { path: 'lockscreen', component: LockscreenComponent},
            { path: 'login', component: AppLoginComponent },
            { path: 'cognito-login', component: CognitoCallbackComponent},
            { path: '**', redirectTo: '' }
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
