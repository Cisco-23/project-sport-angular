import { Component, inject, OnInit, signal } from '@angular/core';
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

  user = signal<User>({});
  isLoading = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadMyProfile();
  }

  loadMyProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    const myEmail = this.authService.getUserEmail();
    
    if (!myEmail) {
      this.errorMessage.set('No se pudo identificar al usuario. Inicia sesión de nuevo.');
      this.isLoading.set(false);
      return;
    }

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const me = users.find(u => u.email === myEmail);
        if (me) {

          const formattedUser = { ...me };
          if (formattedUser.birthDate) {
            formattedUser.birthDate = formattedUser.birthDate.split('T')[0];
          }
          
          this.user.set(formattedUser);
          this.isLoading.set(false);
        } else {
          this.errorMessage.set('No se encontró tu perfil.');
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Error cargando perfil', err);
        this.errorMessage.set('Error al cargar los datos del perfil.');
        this.isLoading.set(false);
      }
    });
  }

  onUpdateProfile(): void {
    const currentUser = this.user();
    
    if (!currentUser.id) {
      this.errorMessage.set('Error: No se puede identificar al usuario');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.userService.updateProfile(currentUser.id, currentUser).subscribe({
      next: () => {
        this.successMessage.set('¡Perfil actualizado correctamente!');
        this.isLoading.set(false);
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Hubo un error al actualizar tus datos.');
        this.isLoading.set(false);
        console.error('Error actualizando perfil:', err);
      }
    });
  }

updateField(field: string, value: any): void {
  this.user.update(current => ({
    ...current,
    [field]: value
  }));
}
}