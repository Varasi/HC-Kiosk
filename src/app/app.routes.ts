import { Routes } from '@angular/router';
import { AppLoginComponent } from './layout/app.login/app.login.component';
import { AppTopbarComponent } from './layout/app.topbar/app.topbar.component';
import { AppLayoutComponent } from './layout/app.layout.component';
import { AccountBookTripComponent } from './layout/app.steps/account-book-trip/account-book-trip.component';
import { DestinationComponent } from './layout/app.steps/destination/destination.component';
import { PickupComponent } from './layout/app.steps/pickup/pickup.component';
import { AccountCheckTripComponent } from './layout/app.steps/account-check-trip/account-check-trip.component';
import { authGuard } from './auth.guard'; 

export const routes: Routes = [
    { path : '', component : AppLoginComponent },
    { path : 'app-topbar', component : AppTopbarComponent ,
        canActivate: [authGuard],},
    { path : 'app-layout', component : AppLayoutComponent,
        canActivate: [authGuard], },
    {
        path: '', component: AppLayoutComponent, 
        //canActivate: 
        //mapToCanActivate([AppAuthGuard]), canLoad: [AppAuthGuard],
        children: [
            { path: 'account-book-trip', component: AccountBookTripComponent,
                canActivate: [authGuard], },
            { path: 'destination', component: DestinationComponent ,
                canActivate: [authGuard],},
            { path: 'pickup', component: PickupComponent ,
                canActivate: [authGuard],},
            { path: 'account-check-trip', component: AccountCheckTripComponent,
                canActivate: [authGuard], }
        ]
    },
    { path: 'login', component: AppLoginComponent },
    { path: '**', redirectTo: '' }
];
