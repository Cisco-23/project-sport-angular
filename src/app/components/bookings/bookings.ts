import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  myBookings: Booking[] = [];
  currentUserId: string = '';
  
  // Estado del formulario
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
      const email = JSON.parse(atob(token.split('.')[1])).sub;
      
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          const me = users.find(u => u.email === email);
          if (me && me.id) {
            this.currentUserId = me.id;
            this.newBooking.player1Id = me.id; // Nos asignamos como Jugador 1
            this.loadMyBookings();
          }
        }
      });
    }
  }

  loadMyBookings(): void {
    this.bookingService.getUserBookings(this.currentUserId).subscribe({
      next: (bookings) => this.myBookings = bookings,
      error: (err) => console.error('Error al cargar historial', err)
    });
  }

  onSubmit(): void {
    if (this.bookingMode === 'individual') {
      // Limpiamos el player2Id por si acaso, ya que buscamos pareja
      this.newBooking.player2Id = undefined; 
      
      this.bookingService.createIndividual(this.newBooking).subscribe({
        next: (res) => {
          const msg = res.isFull ? '¡Asignación automática exitosa! Ya tienes pareja.' : 'Reserva creada. Esperando a que se una otra persona.';
          this.handleSuccess(msg);
        },
        error: () => this.handleError('Error al crear la reserva.')
      });
    } else {
      // Reserva con pareja
      this.bookingService.createWithPartner(this.newBooking).subscribe({
        next: () => this.handleSuccess('¡Reserva con pareja creada con éxito!'),
        error: () => this.handleError('Error al crear la reserva con pareja.')
      });
    }
  }

  handleSuccess(msg: string) {
    this.successMessage = msg;
    this.errorMessage = '';
    this.loadMyBookings(); // Recargamos la tabla para ver la nueva reserva
    setTimeout(() => this.successMessage = '', 4000);
  }

  handleError(msg: string) {
    this.errorMessage = msg;
    this.successMessage = '';
  }
}