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

  private currentUserEmail: string | null = null;
  private currentUserId: string | null = null;

  login(credentials: Login): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }

  register(userData: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData);
  }

  saveToken(token: string): void {
    localStorage.setItem('jwt_token', token);
    this.extractAndSaveTokenData(token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch {
      return null;
    }
  }

  getUserData(): any {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    this.currentUserEmail = null;
    this.currentUserId = null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  private extractAndSaveTokenData(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserEmail = payload.sub;
      if (payload.userId) {
        this.currentUserId = payload.userId;
      }
    } catch (error) {
      console.error('Error decodificando token:', error);
    }
  }
}