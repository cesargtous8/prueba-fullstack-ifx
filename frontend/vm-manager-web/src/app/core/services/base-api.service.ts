import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export abstract class BaseApiService {
  protected readonly http = inject(HttpClient);
  protected readonly apiUrl = environment.apiUrl;
}