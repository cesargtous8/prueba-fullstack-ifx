import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { VmStoreService } from './vm-store.service';
import { IVmApi } from './vm.service';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly store = inject(VmStoreService);
  private connection?: signalR.HubConnection;
  private started = false;

  start() {
    if (this.started) return;
    this.started = true;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(environment.wsUrl, { withCredentials: true })
      .withAutomaticReconnect([0, 1000, 5000, 10000])
      .build();

    this.connection.on('vmChanged', (vm: IVmApi) => this.store.upsertRealtime(vm));
    this.connection.on('vmDeleted', (id: string) => this.store.deleteRealtime(id));

    this.connection.start().catch((err: unknown) => {
      this.started = false;
      console.error('SignalR connection error:', err);
    });
  }

  stop() {
    this.started = false;
    this.connection?.stop();
  }
}
