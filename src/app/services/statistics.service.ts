import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/stats';

  // Estadísticas de jugador
  getMonthlyStats(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/player/${userId}/monthly`);
  }

  getTotalWins(userId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/player/${userId}/wins`);
  }

  getTotalLosses(userId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/player/${userId}/losses`);
  }

  getTotalMatches(userId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/player/${userId}/matches`);
  }

  getFavoriteSport(userId: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/player/${userId}/favorite`);
  }

  getPlayerRanking(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/player/${userId}/ranking`);
  }

  getPlayerEvolution(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/player/${userId}/evolution`);
  }
}