import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatchResult } from '../models/match-result.interface';

@Injectable({
  providedIn: 'root'
})
export class MatchResultService {
  private http = inject(HttpClient);
  
  // La ruta base de tu MatchResultController
  private apiUrl = 'http://localhost:8080/api/results';

  // Llama a @PostMapping (Para guardar el resultado de un partido)
  createMatchResult(result: MatchResult): Observable<MatchResult> {
    return this.http.post<MatchResult>(this.apiUrl, result);
  }

  // Llama a @GetMapping("/wins/{playerId}") (Para cargar las victorias en las estadísticas)
  getPlayerWins(playerId: string): Observable<MatchResult[]> {
    return this.http.get<MatchResult[]>(`${this.apiUrl}/wins/${playerId}`);
  }
}