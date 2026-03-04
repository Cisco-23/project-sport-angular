import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';

  private http = inject(HttpClient);

  // 1. LOGIN: Enviar credenciales y recibir el Token
  login(credentials: { email: string; password: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/auth/login`, credentials);
  }

  // 2. REGISTRO: Enviar el objeto User para crearlo en la base de datos
  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, user);
  }

  // 3. GUARDAR EL TOKEN: Lo metemos en el "almacén" del navegador
  saveToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  // 4. LEER EL TOKEN: Para usarlo luego en las reservas
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  // 5. CERRAR SESIÓN: Borramos el token y adiós muy buenas
  logout(): void {
    localStorage.removeItem('jwt_token');
  }

  // 6. COMPROBAR ESTADO: Devuelve true si hay token, false si no
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}
