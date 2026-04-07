import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user: User = {
    name: '',
    email: '',
    password: '',
    birthDate: '',
    gender: 'M', // Valor por defecto
    level: 'BASIC', // Valor por defecto
    role: 'USER'
  };
  errorMessage: string = '';

  onRegister(): void {
    this.authService.register(this.user).subscribe({
      next: () => {
        // Si se registra con éxito, lo mandamos al login
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = 'Error al registrar el usuario. Comprueba los datos.';
        console.error(err);
      }
    });
  }
}