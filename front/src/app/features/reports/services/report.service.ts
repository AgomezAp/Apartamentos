import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import {
  Report,
  ReportFilter,
  FinancialReport,
  OccupancyReport,
  PaymentReport,
  MaintenanceReport
} from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:3010/api/reports';

  constructor(private http: HttpClient, private notificationService: NotificationService) {}

  // General Reports
  getAll(filter?: ReportFilter): Observable<Report[]> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<Report[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/${id}`);
  }

  generate(reportType: string, parameters: any): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}/generate`, {
      report_type: reportType,
      parameters
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Specific Report Types
  getFinancialReport(startDate: string, endDate: string, buildingId?: number): Observable<FinancialReport[]> {
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    if (buildingId) {
      params = params.set('building_id', buildingId.toString());
    }
    return this.http.get<FinancialReport[]>(`${this.apiUrl}/financial`, { params });
  }

  getRevenueReport(filter?: any): Observable<any> {
    let params = new HttpParams();
    if (filter) {
      if (filter.start_date) params = params.set('start_date', filter.start_date);
      if (filter.end_date) params = params.set('end_date', filter.end_date);
      if (filter.building_id) params = params.set('building_id', filter.building_id.toString());
    }
    return this.http.get<any>(`${this.apiUrl}/revenue`, { params });
  }

  getOccupancyReport(buildingId?: number): Observable<OccupancyReport[]> {
    let params = new HttpParams();
    if (buildingId) {
      params = params.set('building_id', buildingId.toString());
    }
    return this.http.get<OccupancyReport[]>(`${this.apiUrl}/occupancy`, { params });
  }

  getPaymentStatusReport(year: number, month: number, buildingId?: number): Observable<any> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    if (buildingId) {
      params = params.set('building_id', buildingId.toString());
    }
    return this.http.get<any>(`${this.apiUrl}/payment-status`, { params });
  }

  getPaymentReport(startDate: string, endDate: string, buildingId?: number): Observable<any> {
    // Convertir fechas a year y month para usar el endpoint payment-status
    const date = new Date(startDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    if (buildingId) {
      params = params.set('building_id', buildingId.toString());
    }
    return this.http.get<any>(`${this.apiUrl}/payment-status`, { params });
  }

  getMaintenanceReport(startDate: string, endDate: string, buildingId?: number): Observable<MaintenanceReport[]> {
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    if (buildingId) {
      params = params.set('building_id', buildingId.toString());
    }
    return this.http.get<MaintenanceReport[]>(`${this.apiUrl}/maintenance`, { params });
  }

  // Income Reports - Nuevo API especializado
  getIncomeByPeriod(startDate: string, endDate: string, buildingId?: number): Observable<any> {
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    if (buildingId) params = params.set('building_id', buildingId.toString());
    return this.http.get<any>('http://localhost:3010/api/income/period', { params });
  }

  getIncomeTrend(months: number = 6): Observable<any> {
    let params = new HttpParams()
      .set('months', months.toString());
    return this.http.get<any>('http://localhost:3010/api/income/trend', { params });
  }

  getExpensesByPeriod(year: number, month: number): Observable<any> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<any>('http://localhost:3010/api/income/expenses', { params });
  }

  /**
   * Obtener gastos por rango de fechas (start_date, end_date) y opcionalmente filtrar por edificio
   */
  getExpensesByRange(startDate: string, endDate: string, buildingId?: number): Observable<any> {
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    if (buildingId) params = params.set('building_id', buildingId.toString());
    return this.http.get<any>('http://localhost:3010/api/income/expenses', { params });
  }

  getIncomeVsExpenses(startDate: string, endDate: string, buildingId?: number): Observable<any> {
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    if (buildingId) params = params.set('building_id', buildingId.toString());

    return this.http.get<any>('http://localhost:3010/api/income/balance', { params });
  }

  getBalanceTrend(months: number = 6): Observable<any> {
    let params = new HttpParams()
      .set('months', months.toString());
    return this.http.get<any>('http://localhost:3010/api/income/balance-trend', { params });
  }

  getBalanceTrendByPeriod(startDate: string, endDate: string, buildingId?: number): Observable<any> {
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    if (buildingId) params = params.set('building_id', buildingId.toString());
    return this.http.get<any>('http://localhost:3010/api/income/balance-trend-period', { params });
  }

  // Export Methods
  exportToExcel(data: any, filename: string): void {
    // TODO: Implement Excel export using library like xlsx
    console.log('Exporting to Excel:', filename, data);
    this.notificationService.showInfo('Funcionalidad de exportación a Excel en desarrollo');
  }

  exportToPDF(data: any, filename: string): void {
    // TODO: Implement PDF export using library like jsPDF
    console.log('Exporting to PDF:', filename, data);
    this.notificationService.showInfo('Funcionalidad de exportación a PDF en desarrollo');
  }

  exportToCSV(data: any, filename: string): void {
    // Basic CSV export implementation
    if (!data || data.length === 0) {
      this.notificationService.showWarning('No hay datos para exportar');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map((row: any) => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  }
}
