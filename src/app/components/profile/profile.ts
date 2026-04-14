import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  user: User = {};
  successMessage: string = '';
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadMyProfile();
  }

  loadMyProfile(): void {
    const token = this.authService.getToken();
    if (token) {
      // 1. Descodificamos el Payload del JWT (es la segunda parte del token separada por '.')
      const payload = JSON.parse(atob(token.split('.')[1]));
      const myEmail = payload.sub; // Tu JwtUtils guarda el email en el 'sub' (subject)

      // 2. Buscamos al usuario que coincida con este email
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          const me = users.find(u => u.email === myEmail);
          if (me) {
            this.user = { ...me }; // Clonamos los datos para editarlos en el form
            // Formateamos la fecha si viene con hora
            if (this.user.birthDate) {
               this.user.birthDate = this.user.birthDate.split('T')[0];
            }
          }
        },
        error: (err) => console.error('Error cargando perfil', err)
      });
    }
  }

  onUpdateProfile(): void {
    if (this.user.id) {
      this.userService.updateProfile(this.user.id, this.user).subscribe({
        next: () => {
          this.successMessage = '¡Perfil actualizado correctamente!';
          this.errorMessage = '';
          // Ocultar mensaje después de 3 segundos
          setTimeout(() => this.successMessage = '', 3000); 
        },
        error: (err) => {
          this.errorMessage = 'Hubo un error al actualizar tus datos.';
          this.successMessage = '';
          console.error(err);
        }
      });
    }
  }
}