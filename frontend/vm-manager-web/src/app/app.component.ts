import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { RealtimeService } from './core/services/realtime.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: []
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly realtime = inject(RealtimeService);

  ngOnInit() {
    this.auth.me().subscribe({
      next: () => this.realtime.start(),
      error: () => console.log('Not authenticated')
    });
  }

  ngOnDestroy() {
    this.realtime.stop();
  }
}
