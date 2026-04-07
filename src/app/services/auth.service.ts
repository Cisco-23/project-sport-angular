import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Login, AuthResponse } from '../models/auth.interface';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient); 
  

  private apiUrl = 'http://localhost:8080/api/auth'; 

  login(credentials: Login): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }

  register(userData: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData);
  }

  saveToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}