import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface RoleDTO {
  id: number;
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly API_URL = environment.apiUrl || 'http://localhost:3010/api';

  constructor(private http: HttpClient) {}

  getRoles(): Observable<{ success: boolean; data: RoleDTO[] }> {
    return this.http.get<{ success: boolean; data: RoleDTO[] }>(`${this.API_URL}/roles`);
  }
}
