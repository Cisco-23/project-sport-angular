import { Component, OnInit, inject } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { MatchResultService } from '../../services/match-result';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  templateUrl: './statistics.html'
})
export class StatisticsComponent implements OnInit {
  private resultService = inject(MatchResultService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  currentUserId: string = '';
  totalWins: number = 0;

  // Variables para guardar la referencia a los gráficos y poder destruirlos si recargamos
  winsChart: any;
  matchesChart: any;
  evolutionChart: any;

  ngOnInit(): void {
    this.loadUserAndStats();
  }

  loadUserAndStats(): void {
    const token = this.authService.getToken();
    if (token) {
      const email = JSON.parse(atob(token.split('.')[1])).sub;
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          const me = users.find(u => u.email === email);
          if (me && me.id) {
            this.currentUserId = me.id;
            this.loadMyResults();
          }
        }
      });
    }
  }

  loadMyResults(): void {
    // llamo ami backend para traer los resultados
    this.resultService.getPlayerWins(this.currentUserId).subscribe({
      next: (wins) => {
        this.totalWins = wins.length;
        this.renderCharts();
      },
      error: (err) => console.error('Error cargando resultados', err)
    });
  }

  renderCharts(): void {
    // grafico circular
    const ctxWins = document.getElementById('winsChart') as HTMLCanvasElement;
    this.winsChart = new Chart(ctxWins, {
      type: 'doughnut',
      data: {
        labels: ['Victorias', 'Derrotas'],
        datasets: [{
          data: [this.totalWins, 5], // pequeña simulacion
          backgroundColor: ['#198754', '#dc3545']
        }]
      },
      options: { responsive: true, plugins: { title: { display: true, text: 'Porcentaje de Victorias' } } }
    });

    // grafico de barras
    const ctxMatches = document.getElementById('matchesChart') as HTMLCanvasElement;
    this.matchesChart = new Chart(ctxMatches, {
      type: 'bar',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
        datasets: [{
          label: 'Partidos Jugados',
          data: [2, 4, 3, 6, this.totalWins], // Datos de ejemplo
          backgroundColor: '#0d6efd'
        }]
      },
      options: { responsive: true }
    });

    // grafico de lineas
    const ctxEvolution = document.getElementById('evolutionChart') as HTMLCanvasElement;
    this.evolutionChart = new Chart(ctxEvolution, {
      type: 'line',
      data: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        datasets: [{
          label: 'Puntos/Sets Ganados',
          data: [12, 19, 15, 22], // Datos de ejemplo
          borderColor: '#ffc107',
          tension: 0.4, // linea curva
          fill: false
        }]
      },
      options: { responsive: true }
    });
  }
}