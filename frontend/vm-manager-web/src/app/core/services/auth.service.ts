import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IUser } from '../models/contracts';

type UserRole = 'Administrador' | 'Cliente';

interface AuthUserDto {
  id: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _user = signal<IUser | null>(null);
  readonly user = this._user.asReadonly();
  readonly role = computed<UserRole | null>(() => this._user()?.role ?? null);
  readonly isAuthenticated = computed(() => !!this._user());

  isValidUserRole(role: string): role is UserRole {
    return role === 'Administrador' || role === 'Cliente';
  }

  login(payload: { email: string; password: string }): Observable<IUser> {
    return this.http
      .post<AuthUserDto>(`${environment.apiUrl}/auth/login`, payload, { withCredentials: true })
      .pipe(
        map((dto) => this.toIUser(dto)),
        tap((user) => this._user.set(user))
      );
  }

  me(): Observable<IUser | null> {
    return this.http
      .get<AuthUserDto>(`${environment.apiUrl}/auth/me`, { withCredentials: true })
      .pipe(
        map((dto) => this.toIUser(dto)),
        tap((user) => this._user.set(user)),
        catchError(() => {
          this._user.set(null);
          return of(null);
        })
      );
  }

  logout(): void {
    this.http
      .post<void>(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        catchError(() => of(void 0))
      )
      .subscribe(() => {
        this._user.set(null);
      });
  }

  private toIUser(dto: AuthUserDto): IUser {
    if (!this.isValidUserRole(dto.role)) {
      throw new Error(`Invalid role: ${dto.role}`);
    }

    return {
      id: dto.id,
      email: dto.email,
      name: dto.email,
      role: dto.role
    };
  }
}
