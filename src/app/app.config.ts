import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Así se configura el cliente HTTP y el interceptor en Angular 21
    provideHttpClient(withInterceptors([authInterceptor])) 
  ],
};
