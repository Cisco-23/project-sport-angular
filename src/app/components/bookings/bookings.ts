import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; 
import { DatePipe } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Booking } from '../../models/booking.interface';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './bookings.html'
})
export class BookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  myBookings = signal<Booking[]>([]);
  currentUserId: string = '';
  isSubmitting: boolean = false;
  usersList = signal<any[]>([]);
  bookingMode: 'individual' | 'partner' = 'individual';
  newBooking: Booking = {
    dateTime: '',
    courtName: 'Pista de Squash 1',
    player1Id: '',
    player2Id: ''
  };

  successMessage: string = '';
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadCurrentUserAndBookings();
  }

  loadCurrentUserAndBookings(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload.sub;
        
        this.userService.getAllUsers().subscribe({
          next: (users) => {
            this.usersList.set(users);
            const me = users.find(u => u.email === email);
            if (me && me.id) {
              this.currentUserId = me.id;
              this.newBooking.player1Id = me.id; 
              this.loadMyBookings();
            }
          }
        });
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
  }

  loadMyBookings(): void {
    this.bookingService.getUserBookings(this.currentUserId).subscribe({
      next: (bookings) => this.myBookings.set(bookings),
      error: (err) => console.error('Error al cargar historial', err)
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.handleError('Por favor, rellena todos los campos correctamente.');
      return; 
    }

    this.isSubmitting = true;

    if (this.bookingMode === 'individual') {
      this.bookingService.createIndividual(this.newBooking).subscribe({
        next: (res) => {
          const msg = res.isFull ? '¡Asignación exitosa!' : 'Reserva creada.';
          this.handleSuccess(msg, form);
          this.isSubmitting = false;
        },
        error: () => {
          this.handleError('Error al crear la reserva.');
          this.isSubmitting = false;
        }
      });
    } else {
      this.bookingService.createWithPartner(this.newBooking).subscribe({
        next: () => {
          this.handleSuccess('¡Reserva con pareja creada!', form);
          this.isSubmitting = false;
        },
        error: () => {
          this.handleError('Error al crear la reserva.');
          this.isSubmitting = false;
        }
      });
    }
  }

  handleSuccess(msg: string, form: NgForm) {
    this.successMessage = msg;
    this.errorMessage = '';
    this.loadMyBookings(); 

    // Vaciamos el formulario visualmente
    form.resetForm();
    this.bookingMode = 'individual'; 
    this.newBooking = {
      dateTime: '',
      courtName: 'Pista de Squash 1',
      player1Id: this.currentUserId, 
      player2Id: ''
    };

    setTimeout(() => this.successMessage = '', 4000);
  }

  handleError(msg: string) {
    this.errorMessage = msg;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 4000);
  }
  getOpponentName(opponentId: string | undefined): string {
    if (!opponentId) return '---';
    const opponent = this.usersList().find(u => u.id === opponentId);
    // Cambia 'name' por 'email' si tu modelo User no tiene nombre
    return opponent ? (opponent.name || opponent.email) : 'Jugador Desconocido';
  }
}