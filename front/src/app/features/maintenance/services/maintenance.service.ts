import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  MaintenanceRequest, 
  MaintenanceFormData,
  MaintenanceFilter,
  MaintenanceStats,
  MaintenanceUpdate,
  MaintenanceResolve
} from '../models/miantenance.model';
import { ApiResponse } from '../../../core/models/api.model';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private apiUrl = `${environment.apiUrl}/maintenance-requests`;

  constructor(private http: HttpClient) {}

  // ==================== SOLICITUDES ====================

  getAll(filter?: MaintenanceFilter): Observable<ApiResponse<MaintenanceRequest[]>> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.status) params = params.set('status', filter.status);
      if (filter.priority) params = params.set('priority', filter.priority);
      if (filter.unit_id) params = params.set('unit_id', filter.unit_id.toString());
      if (filter.tenant_id) params = params.set('tenant_id', filter.tenant_id.toString());
      if (filter.category) params = params.set('category', filter.category);
    }

    return this.http.get<ApiResponse<MaintenanceRequest[]>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<MaintenanceRequest>> {
    return this.http.get<ApiResponse<MaintenanceRequest>>(`${this.apiUrl}/${id}`);
  }

  getPending(): Observable<ApiResponse<MaintenanceRequest[]>> {
    return this.http.get<ApiResponse<MaintenanceRequest[]>>(`${this.apiUrl}/pending`);
  }

  getUrgent(): Observable<ApiResponse<MaintenanceRequest[]>> {
    return this.http.get<ApiResponse<MaintenanceRequest[]>>(`${this.apiUrl}/urgent`);
  }

  getByUnit(unitId: number): Observable<ApiResponse<MaintenanceRequest[]>> {
    return this.http.get<ApiResponse<MaintenanceRequest[]>>(`${this.apiUrl}/unit/${unitId}`);
  }

  getByTenant(tenantId: number): Observable<ApiResponse<MaintenanceRequest[]>> {
    return this.http.get<ApiResponse<MaintenanceRequest[]>>(`${this.apiUrl}/tenant/${tenantId}`);
  }

  create(request: MaintenanceFormData): Observable<ApiResponse<MaintenanceRequest>> {
    return this.http.post<ApiResponse<MaintenanceRequest>>(this.apiUrl, request);
  }

  update(id: number, request: MaintenanceUpdate): Observable<ApiResponse<MaintenanceRequest>> {
    return this.http.put<ApiResponse<MaintenanceRequest>>(`${this.apiUrl}/${id}`, request);
  }

  resolve(id: number, data: MaintenanceResolve): Observable<ApiResponse<MaintenanceRequest>> {
    return this.http.post<ApiResponse<MaintenanceRequest>>(`${this.apiUrl}/${id}/resolve`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // ==================== ESTADÍSTICAS ====================

  getStats(): Observable<ApiResponse<MaintenanceStats[]>> {
    return this.http.get<ApiResponse<MaintenanceStats[]>>(`${this.apiUrl}/stats`);
  }
}
