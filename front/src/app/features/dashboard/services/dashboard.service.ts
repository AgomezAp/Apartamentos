import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  DashboardStats,
  BuildingStats,
  RevenueData,
  TopTenant,
  RecentPayment,
  PendingTask,
  Alert
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = `${environment.apiUrl}/dashboard`;
  private readonly PAYMENTS_URL = `${environment.apiUrl}/payments`;
  private readonly ALERTS_URL = `${environment.apiUrl}/alerts`;

  constructor(private http: HttpClient) { }

  getGeneralStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.API_URL}/stats`);
  }

  getStatsByBuilding(): Observable<ApiResponse<BuildingStats[]>> {
    return this.http.get<ApiResponse<BuildingStats[]>>(`${this.API_URL}/buildings`);
  }

  getRevenueByMonth(months: number = 12): Observable<ApiResponse<RevenueData[]>> {
    const params = new HttpParams().set('months', months.toString());
    return this.http.get<ApiResponse<RevenueData[]>>(`${this.API_URL}/revenue`, { params });
  }

  getTopTenants(limit: number = 10): Observable<ApiResponse<TopTenant[]>> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ApiResponse<TopTenant[]>>(`${this.API_URL}/top-tenants`, { params });
  }

  getRecentPayments(limit: number = 10): Observable<ApiResponse<RecentPayment[]>> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('sortBy', 'payment_date')
      .set('order', 'desc');
    return this.http.get<ApiResponse<RecentPayment[]>>(this.PAYMENTS_URL, { params });
  }

  getPendingTasks(): Observable<ApiResponse<PendingTask[]>> {
    return this.http.get<ApiResponse<PendingTask[]>>(`${this.API_URL}/tasks`);
  }

  getAlerts(limit: number = 10): Observable<ApiResponse<Alert[]>> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ApiResponse<Alert[]>>(this.ALERTS_URL, { params });
  }

  markAlertAsRead(alertId: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.ALERTS_URL}/${alertId}/read`, {});
  }
}
