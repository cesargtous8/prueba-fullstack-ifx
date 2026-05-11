import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { VmStoreService } from '../../core/services/vm-store.service';

type VmStatus = 'Encendida' | 'Apagada';

@Component({
  selector: 'app-vm-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="vm-form-page">
      <nav class="navbar">
        <div class="nav-left">
          <a routerLink="/vms" class="btn-back">← Back</a>
          <h1>{{ isEdit ? 'Edit VM' : 'Create VM' }}</h1>
        </div>
        <div class="nav-right">
          <span class="user-name">{{ auth.user()?.name }}</span>
          <button (click)="logout()" class="btn-logout">Logout</button>
        </div>
      </nav>

      <div class="container">
        <div class="form-wrapper">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="name">VM Name</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                placeholder="e.g., vm-web-01"
                class="form-control"
              />
              <small class="error" *ngIf="getControl('name')?.invalid && getControl('name')?.touched">
                <span *ngIf="getControl('name')?.errors?.['required']">Name is required</span>
                <span *ngIf="getControl('name')?.errors?.['pattern']">Only alphanumeric and hyphens allowed (3-30 chars)</span>
              </small>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="cores">Cores</label>
                <input
                  id="cores"
                  type="number"
                  formControlName="cores"
                  class="form-control"
                  min="1"
                  max="128"
                />
                <small class="error" *ngIf="getControl('cores')?.invalid && getControl('cores')?.touched">
                  <span *ngIf="getControl('cores')?.errors?.['required']">Cores required</span>
                  <span *ngIf="getControl('cores')?.errors?.['min']">Minimum 1 core</span>
                  <span *ngIf="getControl('cores')?.errors?.['max']">Maximum 128 cores</span>
                </small>
              </div>

              <div class="form-group">
                <label for="ram">RAM (GB)</label>
                <input
                  id="ram"
                  type="number"
                  formControlName="ram"
                  class="form-control"
                  min="1"
                  max="2048"
                />
                <small class="error" *ngIf="getControl('ram')?.invalid && getControl('ram')?.touched">
                  <span *ngIf="getControl('ram')?.errors?.['required']">RAM required</span>
                  <span *ngIf="getControl('ram')?.errors?.['min']">Minimum 1 GB</span>
                  <span *ngIf="getControl('ram')?.errors?.['max']">Maximum 2048 GB</span>
                </small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="disk">Disk (GB)</label>
                <input
                  id="disk"
                  type="number"
                  formControlName="disk"
                  class="form-control"
                  min="1"
                  max="16384"
                />
                <small class="error" *ngIf="getControl('disk')?.invalid && getControl('disk')?.touched">
                  <span *ngIf="getControl('disk')?.errors?.['required']">Disk required</span>
                  <span *ngIf="getControl('disk')?.errors?.['min']">Minimum 1 GB</span>
                  <span *ngIf="getControl('disk')?.errors?.['max']">Maximum 16384 GB</span>
                </small>
              </div>

              <div class="form-group">
                <label for="os">Operating System</label>
                <select formControlName="os" class="form-control">
                  <option value="">Select OS</option>
                  <option value="Ubuntu 22.04">Ubuntu 22.04</option>
                  <option value="Ubuntu 20.04">Ubuntu 20.04</option>
                  <option value="Debian 12">Debian 12</option>
                  <option value="CentOS 8">CentOS 8</option>
                  <option value="Windows Server 2022">Windows Server 2022</option>
                </select>
                <small class="error" *ngIf="getControl('os')?.invalid && getControl('os')?.touched">
                  OS is required
                </small>
              </div>
            </div>

            <div class="form-group">
              <label for="status">Status</label>
              <select formControlName="status" class="form-control">
                <option value="Apagada">Apagada (Off)</option>
                <option value="Encendida">Encendida (On)</option>
              </select>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-submit" [disabled]="!form.valid || loading">
                {{ loading ? 'Saving...' : (isEdit ? 'Update VM' : 'Create VM') }}
              </button>
              <a routerLink="/vms" class="btn-cancel">Cancel</a>
            </div>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vm-form-page {
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
      max-width: 600px;
      margin: 0 auto;
    }

    .form-wrapper {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s, box-shadow 0.3s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .error {
      display: block;
      color: #e74c3c;
      font-size: 0.75rem;
      margin-top: 0.375rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-submit,
    .btn-cancel {
      flex: 1;
      padding: 0.875rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-submit {
      background: #667eea;
      color: white;
    }

    .btn-submit:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-cancel {
      background: #f0f0f0;
      color: #333;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-cancel:hover {
      background: #e0e0e0;
    }

    .error-message {
      background: #fadbd8;
      color: #c0392b;
      padding: 1rem;
      border-radius: 6px;
      margin-top: 1rem;
    }
  `]
})
export class VmFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly store = inject(VmStoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9-]{3,30}$/)]],
    cores: [4, [Validators.required, Validators.min(1), Validators.max(128)]],
    ram: [16, [Validators.required, Validators.min(1), Validators.max(2048)]],
    disk: [100, [Validators.required, Validators.min(1), Validators.max(16384)]],
    os: ['Ubuntu 22.04', Validators.required],
    status: this.fb.nonNullable.control<VmStatus>('Apagada', { validators: [Validators.required] })
  });

  isEdit = false;
  vmId = '';
  loading = false;
  errorMessage = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEdit = true;
    this.vmId = id;

    const vm = this.store.vms().find((x) => x.id === id);
    if (!vm) {
      this.router.navigate(['/vms']);
      return;
    }

    this.form.patchValue({
      name: vm.name,
      cores: vm.cores,
      ram: vm.ram,
      disk: vm.disk,
      os: vm.os,
      status: vm.status
    });
  }

  getControl(name: string): AbstractControl | null {
    return this.form.get(name);
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      status: raw.status as VmStatus
    };

    const request$ = this.isEdit
      ? this.store.updateOptimistic(this.vmId, payload)
      : this.store.createOptimistic(payload);

    request$
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => this.router.navigate(['/vms']),
        error: (err: HttpErrorResponse) => {
          this.errorMessage = this.resolveApiError(err);
        }
      });
  }

  logout() {
    const result = this.auth.logout() as unknown;
    if (result && typeof (result as { subscribe?: unknown }).subscribe === 'function') {
      (result as { subscribe: (handlers: { next: () => void }) => void }).subscribe({
        next: () => this.router.navigate(['/login'])
      });
      return;
    }

    this.router.navigate(['/login']);
  }

  private resolveApiError(err: HttpErrorResponse): string {
    const apiMessage =
      (err.error && typeof err.error === 'object' && 'message' in err.error
        ? String((err.error as { message?: string }).message)
        : '') || '';

    if (apiMessage) return apiMessage;
    if (err.status === 400) return 'Datos inválidos. Verifica el formulario.';
    if (err.status === 401) return 'No autorizado.';
    if (err.status === 403) return 'No tienes permisos para esta acción.';
    if (err.status === 0) return 'No se pudo conectar con el servidor.';
    return `Error de servidor (${err.status}).`;
  }
}