import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { VmStoreService } from '../../core/services/vm-store.service';

@Component({
  selector: 'app-vm-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="vm-list-page">
      <nav class="navbar">
        <div class="nav-left">
          <a routerLink="/dashboard" class="btn-back">← Back</a>
          <h1>Virtual Machines</h1>
        </div>
        <div class="nav-right">
          <span class="user-name">{{ auth.user()?.name }}</span>
          <button (click)="logout()" class="btn-logout">Logout</button>
        </div>
      </nav>

      <div class="container">
        <div class="header">
          <h2>VM Management</h2>
          <a *ngIf="isAdmin()" routerLink="/vms/new" class="btn-primary">
            + New VM
          </a>
        </div>

        <div class="vm-grid" *ngIf="!store.loading() && store.vms().length > 0">
          <div *ngFor="let vm of store.vms()" class="vm-card">
            <div class="vm-header">
              <h3>{{ vm.name }}</h3>
              <span class="status" [class.running]="vm.status === 'Encendida'">
                {{ vm.status }}
              </span>
            </div>

            <div class="vm-specs">
              <div class="spec">
                <span class="label">Cores:</span>
                <span class="value">{{ vm.cores }}</span>
              </div>
              <div class="spec">
                <span class="label">RAM (GB):</span>
                <span class="value">{{ vm.ram }}</span>
              </div>
              <div class="spec">
                <span class="label">Disk (GB):</span>
                <span class="value">{{ vm.disk }}</span>
              </div>
              <div class="spec">
                <span class="label">OS:</span>
                <span class="value">{{ vm.os }}</span>
              </div>
            </div>

            <div class="vm-actions" *ngIf="isAdmin()">
              <a [routerLink]="['/vms', vm.id, 'edit']" class="btn-edit">
                Edit
              </a>
              <button (click)="deleteVm(vm.id)" class="btn-delete">
                Delete
              </button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="!store.loading() && store.vms().length === 0">
          <p>No virtual machines found</p>
        </div>

        <div class="loading-skeleton" *ngIf="store.loading()">
          <div class="skeleton-card" *ngFor="let i of [1, 2, 3]"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vm-list-page {
      min-height: 100vh;
      background: #f5f5f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .navbar {
      background: white;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .btn-back {
      background: #f0f0f0;
      color: #333;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 6px;
      text-decoration: none;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.3s;
    }

    .btn-back:hover {
      background: #e0e0e0;
    }

    .nav-left h1 {
      margin: 0;
      color: #333;
      font-size: 1.75rem;
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .user-name {
      color: #666;
      font-weight: 500;
    }

    .btn-logout {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.3s;
    }

    .btn-logout:hover {
      background: #c0392b;
    }

    .container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h2 {
      margin: 0;
      color: #333;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.3s;
      display: inline-block;
    }

    .btn-primary:hover {
      background: #5568d3;
    }

    .vm-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .vm-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .vm-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    }

    .vm-header {
      padding: 1.5rem;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .vm-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.125rem;
    }

    .status {
      background: #ffeaa7;
      color: #d4af37;
      padding: 0.375rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status.running {
      background: #a9dfbf;
      color: #27ae60;
    }

    .vm-specs {
      padding: 1.5rem;
      background: #fafafa;
    }

    .spec {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
    }

    .spec:last-child {
      margin-bottom: 0;
    }

    .spec .label {
      color: #999;
      font-weight: 500;
    }

    .spec .value {
      color: #333;
      font-weight: 600;
    }

    .vm-actions {
      padding: 1rem 1.5rem;
      display: flex;
      gap: 0.75rem;
      border-top: 1px solid #f0f0f0;
    }

    .btn-edit,
    .btn-delete {
      flex: 1;
      padding: 0.625rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.3s;
    }

    .btn-edit {
      background: #3498db;
      color: white;
    }

    .btn-edit:hover {
      background: #2980b9;
    }

    .btn-delete {
      background: #e74c3c;
      color: white;
    }

    .btn-delete:hover {
      background: #c0392b;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #999;
    }

    .loading-skeleton {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .skeleton-card {
      background: white;
      border-radius: 8px;
      height: 250px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `]
})
export class VmListComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly store = inject(VmStoreService);
  private readonly router = inject(Router);

  ngOnInit() {
    this.store.load();
  }

  isAdmin() {
    return this.auth.user()?.role === 'Administrador';
  }

  deleteVm(id: string) {
    if (confirm('Are you sure you want to delete this VM?')) {
      this.store.deleteOptimistic(id).subscribe({
        error: () => alert('Failed to delete VM')
      });
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}