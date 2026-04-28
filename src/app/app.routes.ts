import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component/login.component';
import { RegisterComponent } from './components/register.component/register.component';
import { DashboardComponent } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';
import { ProfileComponent } from './components/profile/profile';
import { BookingsComponent } from './components/bookings/bookings';
import { StatisticsComponent } from './components/statistics/statistics';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
            { path: 'profile', component: ProfileComponent },
     
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'bookings', component: BookingsComponent },
      { path: 'statistics', component: StatisticsComponent }
     
    ]
  }
];
