import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.interface';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/bookings';

  // Llama a @PostMapping("/individual")
  createIndividual(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/individual`, booking);
  }

  // Llama a @PostMapping("/with-partner")
  createWithPartner(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/with-partner`, booking);
  }

  // Llama a @GetMapping("/user/{userId}")
  getUserBookings(userId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Llama a @GetMapping("/date/{date}")
  getBookingsByDate(date: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/date/${date}`);
  }

  // Llama a @DeleteMapping("/{id}")
  cancelBooking(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  
getPendingResults(userId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/user/${userId}/pending-results`);
}
}