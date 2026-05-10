import { Component, OnInit, inject, ViewChild, ElementRef, OnDestroy, signal } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { StatisticsService } from '../../services/statistics.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  templateUrl: './statistics.html'
})
export class StatisticsComponent implements OnInit, OnDestroy {
  private statsService = inject(StatisticsService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  currentUserId = signal<string>('');
  totalWins = signal<number>(0);
  totalLosses = signal<number>(0);
  totalMatches = signal<number>(0);
  winPercentage = signal<number>(0);
  rankingPosition = signal<number>(0);
  totalPlayers = signal<number>(0);
  favoriteSport = signal<string>('');
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  private winsChartInstance: any;
  private matchesChartInstance: any;
  private evolutionChartInstance: any;

  @ViewChild('winsChart') winsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('matchesChart') matchesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('evolutionChart') evolutionChartRef!: ElementRef<HTMLCanvasElement>;

  ngOnInit(): void {
    this.loadUserAndStats();
  }

  ngOnDestroy(): void {
    if (this.winsChartInstance) this.winsChartInstance.destroy();
    if (this.matchesChartInstance) this.matchesChartInstance.destroy();
    if (this.evolutionChartInstance) this.evolutionChartInstance.destroy();
  }

  loadUserAndStats(): void {
    const tokenData = this.authService.getUserData();
    
    if (tokenData && tokenData.userId) {
      this.currentUserId.set(tokenData.userId);
      this.loadAllStats();
    } else {
      this.loadUserByEmail();
    }
  }

  loadUserByEmail(): void {
    const myEmail = this.authService.getUserEmail();
    
    if (!myEmail) {
      this.errorMessage.set('No se pudo identificar al usuario');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const me = users.find(u => u.email === myEmail);
        if (me && me.id) {
          this.currentUserId.set(me.id);
          this.errorMessage.set('');
          this.loadAllStats();
        } else {
          this.errorMessage.set('No se encontró tu perfil de usuario');
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.errorMessage.set('Error de conexión');
        this.isLoading.set(false);
      }
    });
  }

  loadAllStats(): void {
    const userId = this.currentUserId();
    if (!userId) return;

    this.isLoading.set(true);

    this.statsService.getTotalWins(userId).subscribe({
      next: (wins) => {
        this.totalWins.set(wins);
        this.loadLosses();
      },
      error: () => {
        this.totalWins.set(0);
        this.loadLosses();
      }
    });

    this.statsService.getMonthlyStats(userId).subscribe({
      next: (data) => this.renderMatchesChart(data.months, data.counts),
      error: () => this.renderMatchesChart([], [])
    });

    this.statsService.getPlayerRanking(userId).subscribe({
      next: (data) => {
        this.rankingPosition.set(data.position);
        this.totalPlayers.set(data.totalPlayers);
      },
      error: () => {
        this.rankingPosition.set(0);
        this.totalPlayers.set(0);
      }
    });

    this.statsService.getPlayerEvolution(userId).subscribe({
      next: (data) => this.renderEvolutionChart(data.values),
      error: () => this.renderEvolutionChart([0, 0, 0, 0])
    });

    this.statsService.getFavoriteSport(userId).subscribe({
      next: (sport) => {
        this.favoriteSport.set(sport);
        this.isLoading.set(false);
        this.errorMessage.set('');
      },
      error: () => {
        this.favoriteSport.set('Squash');
        this.isLoading.set(false);
      }
    });
  }

  loadLosses(): void {
    const userId = this.currentUserId();
    
    this.statsService.getTotalLosses(userId).subscribe({
      next: (losses) => {
        this.totalLosses.set(losses);
        const matches = this.totalWins() + this.totalLosses();
        this.totalMatches.set(matches);
        this.winPercentage.set(matches > 0 ? Math.round((this.totalWins() / matches) * 100) : 0);
        this.renderWinsChart();
      },
      error: () => {
        this.totalLosses.set(0);
        this.totalMatches.set(this.totalWins());
        this.winPercentage.set(this.totalMatches() > 0 ? 100 : 0);
        this.renderWinsChart();
      }
    });
  }

  renderWinsChart(): void {
    const ctx = this.winsChartRef?.nativeElement;
    if (!ctx) return;
    
    if (this.winsChartInstance) this.winsChartInstance.destroy();
    
    this.winsChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Victorias', 'Derrotas'],
        datasets: [{
          data: [this.totalWins(), this.totalLosses()],
          backgroundColor: ['#198754', '#dc3545']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: `Victorias: ${this.winPercentage()}%` },
          legend: { position: 'bottom' }
        }
      }
    });
  }

  renderMatchesChart(months: string[], counts: number[]): void {
    const ctx = this.matchesChartRef?.nativeElement;
    if (!ctx) return;
    
    if (this.matchesChartInstance) this.matchesChartInstance.destroy();
    
    const defaultMonths = months.length > 0 ? months : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const defaultCounts = counts.length > 0 ? counts : [0, 0, 0, 0, 0, 0];
    
    this.matchesChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: defaultMonths,
        datasets: [{
          label: 'Partidos Jugados',
          data: defaultCounts,
          backgroundColor: '#0d6efd',
          borderRadius: 5
        }]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Partidos por Mes' } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }

  renderEvolutionChart(values: number[]): void {
    const ctx = this.evolutionChartRef?.nativeElement;
    if (!ctx) return;
    
    if (this.evolutionChartInstance) this.evolutionChartInstance.destroy();
    
    const defaultValues = values.length > 0 ? values : [0, 0, 0, 0];
    
    this.evolutionChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        datasets: [{
          label: 'Rendimiento',
          data: defaultValues,
          borderColor: '#ffc107',
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Evolución del Rendimiento' } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }
}