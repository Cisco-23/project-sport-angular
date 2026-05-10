import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="row mt-4">
      <div class="col-12">
        <div class="jumbotron bg-light p-5 rounded">
          <h1 class="display-4">🎾 Bienvenido a PistasApp</h1>
          <p class="lead">Gestiona tus reservas, registra resultados y consulta tus estadísticas.</p>
          <hr class="my-4">
          <p>Selecciona una opción para empezar:</p>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-body text-center">
            <i class="bi bi-calendar-check display-4 text-primary"></i>
            <h5 class="card-title mt-3">Mis Reservas</h5>
            <p class="card-text">Crea y gestiona tus reservas de pista</p>
            <a routerLink="/dashboard/bookings" class="btn btn-primary">Ir a Reservas</a>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-body text-center">
            <i class="bi bi-trophy display-4 text-warning"></i>
            <h5 class="card-title mt-3">Resultados</h5>
            <p class="card-text">Registra los resultados de tus partidos</p>
            <a routerLink="/dashboard/results" class="btn btn-warning">Ir a Resultados</a>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-body text-center">
            <i class="bi bi-graph-up display-4 text-success"></i>
            <h5 class="card-title mt-3">Estadísticas</h5>
            <p class="card-text">Consulta tu rendimiento y ranking</p>
            <a routerLink="/dashboard/statistics" class="btn btn-success">Ir a Estadísticas</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardHomeComponent {}