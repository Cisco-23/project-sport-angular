import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
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
export class BookingsComponent implements OnInit, OnDestroy {
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  myBookings = signal<Booking[]>([]);
  currentUserId = signal<string>('');
  isSubmitting = signal<boolean>(false);
  usersList = signal<any[]>([]);
  bookingMode = signal<'individual' | 'partner'>('individual');
  selectedCourt = signal<string>('Pista de Squash 1');
  selectedDateTime = signal<string>('');
  partnerId = signal<string>('');
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  private autoRefreshInterval: any;

  ngOnInit(): void {
    this.loadCurrentUserAndBookings();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }

  private startAutoRefresh(): void {
    this.autoRefreshInterval = setInterval(() => {
      if (this.currentUserId()) {
        this.loadMyBookings();
      }
    }, 10000);
  }

  loadCurrentUserAndBookings(): void {
    const email = this.authService.getUserEmail();
    
    if (!email) {
      return;
    }

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.usersList.set(users);
        const me = users.find(u => u.email === email);
        if (me && me.id) {
          this.currentUserId.set(me.id);
          this.loadMyBookings();
        }
      }
    });
  }

  loadMyBookings(): void {
    const userId = this.currentUserId();
    if (!userId) return;

    this.bookingService.getUserBookings(userId).subscribe({
      next: (bookings) => {
        this.myBookings.set(bookings);
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.errorMessage.set('Por favor, rellena todos los campos correctamente.');
      return; 
    }

    const userId = this.currentUserId();
    if (!userId) {
      this.errorMessage.set('Error: No se pudo identificar al usuario.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.bookingMode() === 'individual') {
      const bookingData: Booking = {
        dateTime: this.selectedDateTime(),
        courtName: this.selectedCourt(),
        player1Id: userId
      };

      this.bookingService.createIndividual(bookingData).subscribe({
        next: (res) => {
          const msg = res.isFull 
            ? '¡Asignación automática exitosa! Se te ha asignado un rival.' 
            : 'Reserva creada. Esperando rival.';
          this.handleSuccess(msg, form);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || err.error || 'Error al crear la reserva.');
          this.isSubmitting.set(false);
        }
      });
    } else {
      if (!this.partnerId() || this.partnerId().trim() === '') {
        this.errorMessage.set('Debes introducir el email del jugador 2');
        this.isSubmitting.set(false);
        return;
      }

      const currentEmail = this.authService.getUserEmail();
      if (this.partnerId().trim().toLowerCase() === currentEmail?.toLowerCase()) {
        this.errorMessage.set('No puedes hacer una reserva contigo mismo');
        this.isSubmitting.set(false);
        return;
      }

      const bookingData: Booking = {
        dateTime: this.selectedDateTime(),
        courtName: this.selectedCourt(),
        player1Id: userId,
        player2Id: this.partnerId().trim()
      };

      this.bookingService.createWithPartner(bookingData).subscribe({
        next: () => {
          this.handleSuccess('¡Reserva con pareja creada exitosamente!', form);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || err.error || 'Error al crear la reserva con pareja.');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  handleSuccess(msg: string, form: NgForm): void {
    this.successMessage.set(msg);
    this.errorMessage.set('');
    this.isSubmitting.set(false);
    
    form.resetForm();
    this.bookingMode.set('individual');
    this.selectedCourt.set('Pista de Squash 1');
    this.selectedDateTime.set('');
    this.partnerId.set('');
    
    setTimeout(() => {
      this.loadMyBookings();
    }, 300);
    
    setTimeout(() => this.successMessage.set(''), 5000);
  }

  getOpponentName(opponentId: string | undefined): string {
    if (!opponentId) return '---';
    if (opponentId === this.currentUserId()) return 'Tú mismo (error)';
    const opponent = this.usersList().find(u => u.id === opponentId);
    return opponent ? (opponent.name || opponent.email) : 'Rival Desconocido';
  }
}