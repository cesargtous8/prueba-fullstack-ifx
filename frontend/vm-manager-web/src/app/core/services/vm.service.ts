import { Injectable, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { finalize, tap } from 'rxjs/operators';

export interface IVmApi {
  id: string;
  name: string;
  cores: number;
  ramGb: number;
  diskGb: number;
  os?: string;
  status: 'Activa' | 'Detenida';
}

export interface IVmCreateRequest {
  name: string;
  cores: number;
  ramGb: number;
  diskGb: number;
  os: string;
  status: 'Activa' | 'Detenida';
}

@Injectable({ providedIn: 'root' })
export class VmService extends BaseApiService {
  readonly vms = signal<IVmApi[]>([]);
  readonly loading = signal(false);

  getAll() {
    return this.http.get<IVmApi[]>(`${this.apiUrl}/vms`);
  }

  load() {
    this.loading.set(true);
    return this.getAll().pipe(
      tap((data: IVmApi[]) => this.vms.set(data)),
      finalize(() => this.loading.set(false))
    );
  }

  create(payload: IVmCreateRequest) {
    return this.http.post<IVmApi>(`${this.apiUrl}/vms`, payload);
  }

  update(id: string, payload: Partial<IVmCreateRequest>) {
    return this.http.put<IVmApi>(`${this.apiUrl}/vms/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/vms/${id}`);
  }
}