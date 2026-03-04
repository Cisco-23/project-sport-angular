import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login';
import { RegisterComponent } from './features/auth/components/register/register';

export const routes: Routes = [
  // Cuando alguien entre a http://localhost:4200/login, Angular cargará este componente
  { path: 'login', component: LoginComponent },

  { path: 'register', component: RegisterComponent },

  // Ruta por defecto: si alguien entra a http://localhost:4200/ (sin nada más), lo enviamos al login
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Ruta comodín: si alguien escribe una URL que no existe (ej: /pepito), lo enviamos al login
  { path: '**', redirectTo: '/login' },
];
