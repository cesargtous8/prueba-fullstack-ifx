import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { VmStoreService } from '../../core/services/vm-store.service';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <nav class="navbar">
        <div class="nav-left">
          <h1>Dashboard</h1>
        </div>
        <div class="nav-right">
          <span class="user-name">{{ auth.user()?.name }}</span>
          <button (click)="logout()" class="btn-logout">Logout</button>
        </div>
      </nav>

      <div class="container">
        <div class="header">
          <h2>Resource Overview</h2>
          <a *ngIf="isAdmin()" routerLink="/vms" class="btn-primary">Manage VMs</a>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Cores</div>
            <div class="stat-value">{{ store.totalCores() }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total RAM (GB)</div>
            <div class="stat-value">{{ store.totalRam() }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Disk (GB)</div>
            <div class="stat-value">{{ store.totalDisk() }}</div>
          </div>
        </div>

        <div class="chart-container">
          <h3>Resource Distribution</h3>
          <canvas #resourceChart></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly auth = inject(AuthService);
  readonly store = inject(VmStoreService);
  private readonly router = inject(Router);

  @ViewChild('resourceChart', { static: false }) chartRef?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart<'doughnut'>;

  ngOnInit() {
    this.store.load();
  }

  ngAfterViewInit() {
    const ctx = this.chartRef?.nativeElement;
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Cores', 'RAM', 'Disk'],
        datasets: [
          {
            data: [this.store.totalCores(), this.store.totalRam(), this.store.totalDisk()],
            backgroundColor: ['#667eea', '#764ba2', '#f093fb'],
            borderColor: ['#667eea', '#764ba2', '#f093fb']
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  isAdmin() {
    return this.auth.user()?.role === 'Administrador';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}