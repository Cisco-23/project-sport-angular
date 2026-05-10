import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatchResultService } from '../../services/match-result';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { MatchResult } from '../../models/match-result.interface';
import { Booking } from '../../models/booking.interface';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './results.component.html'
})
export class ResultsComponent implements OnInit {
  private matchResultService = inject(MatchResultService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  currentUserId = signal<string>('');
  completedBookings = signal<Booking[]>([]);
  usersList = signal<any[]>([]);
  matchSets = signal<{ [bookingId: string]: { player1Sets: number, player2Sets: number } }>({});
  successMessage = signal<string>('');
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    const tokenData = this.authService.getUserData();
    
    if (tokenData && tokenData.userId) {
      this.currentUserId.set(tokenData.userId);
      this.loadAllData();
    } else {
      const email = this.authService.getUserEmail();
      if (!email) {
        this.errorMessage.set('No se pudo identificar al usuario');
        return;
      }

      this.userService.getAllUsers().subscribe({
        next: (users) => {
          this.usersList.set(users);
          const me = users.find(u => u.email === email);
          if (me && me.id) {
            this.currentUserId.set(me.id);
            this.loadAllData();
          }
        },
        error: (err) => {
          console.error('Error cargando usuarios:', err);
          this.errorMessage.set('Error al cargar datos del usuario');
        }
      });
    }
  }


loadAllData(): void {
    this.isLoading.set(true);
    const userId = this.currentUserId();
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.usersList.set(users);
      }
    });

    this.bookingService.getPendingResults(userId).subscribe({
      next: (bookings) => {
        this.completedBookings.set(bookings);
        
        const sets: { [key: string]: { player1Sets: number, player2Sets: number } } = {};
        bookings.forEach(booking => {
          if (booking.id) {
            sets[booking.id] = { player1Sets: 0, player2Sets: 0 };
          }
        });
        this.matchSets.set(sets);
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando reservas:', err);
        this.errorMessage.set('Error al cargar las reservas');
        this.isLoading.set(false);
      }
    });
}

  getOpponentName(booking: Booking): string {
    if (!booking.player1Id || !booking.player2Id) return '---';
    
    const opponentId = booking.player1Id === this.currentUserId() 
      ? booking.player2Id 
      : booking.player1Id;
    
    if (opponentId === this.currentUserId()) return 'Tú mismo';
    
    const opponent = this.usersList().find(u => u.id === opponentId);
    return opponent ? (opponent.name || opponent.email || 'Usuario') : 'Rival Desconocido';
  }

  updateSets(bookingId: string, player: 'player1Sets' | 'player2Sets', value: number): void {
    const currentSets = this.matchSets();
    if (!currentSets[bookingId]) {
      currentSets[bookingId] = { player1Sets: 0, player2Sets: 0 };
    }
    currentSets[bookingId][player] = value;
    this.matchSets.set({...currentSets});
  }

onSubmitResult(booking: Booking): void {
    if (!booking.id) {
      this.errorMessage.set('Error: Reserva sin identificador');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    const sets = this.matchSets()[booking.id];
    
    if (!sets || (sets.player1Sets === 0 && sets.player2Sets === 0)) {
      this.errorMessage.set('Debes introducir los sets de ambos jugadores');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    if (sets.player1Sets === sets.player2Sets) {
      this.errorMessage.set('No puede haber empate en sets');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    if (sets.player1Sets < 0 || sets.player1Sets > 5 || 
        sets.player2Sets < 0 || sets.player2Sets > 5) {
      this.errorMessage.set('Los sets deben estar entre 0 y 5');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    const winnerId = sets.player1Sets > sets.player2Sets 
      ? booking.player1Id 
      : booking.player2Id;

    const result: MatchResult = {
      bookingId: booking.id,
      player1Sets: sets.player1Sets,
      player2Sets: sets.player2Sets,
      winnerId: winnerId
    };

    this.matchResultService.createMatchResult(result).subscribe({

next: (response) => {
    this.successMessage.set('¡Resultado registrado correctamente!');
    this.errorMessage.set('');
    
 
    const currentBookings = this.completedBookings();
    const updatedBookings = currentBookings.filter(b => b.id !== booking.id);
    this.completedBookings.set(updatedBookings);
    
    setTimeout(() => this.successMessage.set(''), 3000);
},
      error: (err) => {
        console.error('Error al guardar resultado:', err);
        this.errorMessage.set(err.error?.message || 'Error al registrar el resultado');
        setTimeout(() => this.errorMessage.set(''), 4000);
      }
    });
  }
}