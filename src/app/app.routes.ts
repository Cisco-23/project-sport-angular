import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component/login.component';
import { RegisterComponent } from './components/register.component/register.component';
import { DashboardComponent } from './components/dashboard/dashboard';
import { DashboardHomeComponent } from './components/dashboard/dashboard-home.component';
import { authGuard } from './guards/auth-guard';
import { ProfileComponent } from './components/profile/profile';
import { BookingsComponent } from './components/bookings/bookings';
import { ResultsComponent } from './components/results/results.component';
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
      // OPCIÓN A: Página de inicio del dashboard
      { path: '', component: DashboardHomeComponent },
      
      // OPCIÓN B: Redirigir a bookings directamente
      // { path: '', redirectTo: 'bookings', pathMatch: 'full' },
      
      { path: 'profile', component: ProfileComponent },
      { path: 'bookings', component: BookingsComponent },
      { path: 'results', component: ResultsComponent },
      { path: 'statistics', component: StatisticsComponent }
    ]
  }
];