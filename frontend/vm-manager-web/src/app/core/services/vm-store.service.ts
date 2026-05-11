import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { IVmApi, IVmCreateRequest, VmService } from './vm.service';

export type VmStatusUi = 'Encendida' | 'Apagada';

export interface VmRequest {
  name: string;
  cores: number;
  ram: number;
  disk: number;
  os: string;
  status: VmStatusUi;
}

export interface VmView extends VmRequest {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class VmStoreService {
  private readonly api = inject(VmService);

  readonly vms = signal<VmView[]>([]);
  readonly loading = signal(false);

  readonly totalCores = computed(() => this.vms().reduce((acc, vm) => acc + vm.cores, 0));
  readonly totalRam = computed(() => this.vms().reduce((acc, vm) => acc + vm.ram, 0));
  readonly totalDisk = computed(() => this.vms().reduce((acc, vm) => acc + vm.disk, 0));

  load(): void {
    this.loading.set(true);
    this.api.getAll().subscribe({
      next: (data: IVmApi[]) => this.vms.set(data.map((x) => this.toView(x))),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }

  createOptimistic(payload: VmRequest): Observable<IVmApi> {
    const snapshot = this.vms();
    const tempId = crypto.randomUUID();
    this.vms.set([...snapshot, { id: tempId, ...payload }]);

    return this.api.create(this.toApi(payload)).pipe(
      tap({
        next: (created) =>
          this.vms.update((list) => list.map((x) => (x.id === tempId ? this.toView(created) : x))),
        error: () => this.vms.set(snapshot)
      })
    );
  }

  updateOptimistic(id: string, payload: VmRequest): Observable<IVmApi> {
    const snapshot = this.vms();
    this.vms.update((list) => list.map((x) => (x.id === id ? { ...x, ...payload } : x)));

    return this.api.update(id, this.toApi(payload)).pipe(
      tap({
        next: (updated) =>
          this.vms.update((list) => list.map((x) => (x.id === id ? this.toView(updated) : x))),
        error: () => this.vms.set(snapshot)
      })
    );
  }

  deleteOptimistic(id: string): Observable<void> {
    const snapshot = this.vms();
    this.vms.update((list) => list.filter((x) => x.id !== id));

    return this.api.remove(id).pipe(
      tap({ error: () => this.vms.set(snapshot) })
    );
  }

  upsertRealtime(vm: IVmApi): void {
    const next = this.toView(vm);
    const exists = this.vms().some((x) => x.id === vm.id);
    this.vms.update((list) => (exists ? list.map((x) => (x.id === vm.id ? next : x)) : [...list, next]));
  }

  deleteRealtime(id: string): void {
    this.vms.update((list) => list.filter((x) => x.id !== id));
  }

  patchStatusRealtime(id: string, status: 'Activa' | 'Detenida'): void {
    const uiStatus: VmStatusUi = status === 'Activa' ? 'Encendida' : 'Apagada';
    this.vms.update((list) => list.map((x) => (x.id === id ? { ...x, status: uiStatus } : x)));
  }

  private toView(vm: IVmApi): VmView {
    return {
      id: vm.id,
      name: vm.name,
      cores: vm.cores,
      ram: vm.ramGb,
      disk: vm.diskGb,
      os: vm.os ?? 'Ubuntu 22.04',
      status: vm.status === 'Activa' ? 'Encendida' : 'Apagada'
    };
  }

  private toApi(payload: VmRequest): IVmCreateRequest {
    return {
      name: payload.name,
      cores: payload.cores,
      ramGb: payload.ram,
      diskGb: payload.disk,
      os: payload.os,
      status: payload.status === 'Encendida' ? 'Activa' : 'Detenida'
    };
  }
}