import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
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


  private winsChartInstance: any;
  private matchesChartInstance: any;
  private evolutionChartInstance: any;


  @ViewChild('winsChart') winsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('matchesChart') matchesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('evolutionChart') evolutionChartRef!: ElementRef<HTMLCanvasElement>;

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
    this.resultService.getPlayerWins(this.currentUserId).subscribe({
      next: (wins) => {
        this.totalWins = wins.length;
        this.renderCharts();
      },
      error: (err) => console.error('Error cargando resultados', err)
    });
  }

  renderCharts(): void {
    // Usamos el nativeElement del ViewChild en lugar del document.getElementById
    const ctxWins = this.winsChartRef.nativeElement;
    if (this.winsChartInstance) this.winsChartInstance.destroy();
    this.winsChartInstance = new Chart(ctxWins, {
      type: 'doughnut',
      data: {
        labels: ['Victorias', 'Derrotas'],
        datasets: [{
          data: [this.totalWins, 5],
          backgroundColor: ['#198754', '#dc3545']
        }]
      },
      options: { responsive: true, plugins: { title: { display: true, text: 'Porcentaje de Victorias' } } }
    });

    const ctxMatches = this.matchesChartRef.nativeElement;
    if (this.matchesChartInstance) this.matchesChartInstance.destroy();
    this.matchesChartInstance = new Chart(ctxMatches, {
      type: 'bar',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
        datasets: [{
          label: 'Partidos Jugados',
          data: [2, 4, 3, 6, this.totalWins],
          backgroundColor: '#0d6efd'
        }]
      },
      options: { responsive: true }
    });

    const ctxEvolution = this.evolutionChartRef.nativeElement;
    if (this.evolutionChartInstance) this.evolutionChartInstance.destroy();
    this.evolutionChartInstance = new Chart(ctxEvolution, {
      type: 'line',
      data: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        datasets: [{
          label: 'Puntos/Sets Ganados',
          data: [12, 19, 15, 22],
          borderColor: '#ffc107',
          tension: 0.4,
          fill: false
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}