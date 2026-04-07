import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Login } from '../../models/auth.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink], // Importamos lo necesario aquí
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials: Login = { email: '', password: '' };
  errorMessage: string = '';

  onLogin(): void {
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        // Redirigimos al dashboard una vez logueado
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.';
        console.error('Error en login', err);
      }
    });
  }
}