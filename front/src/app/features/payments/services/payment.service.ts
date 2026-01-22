import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api.model';
import { Payment, PaymentFilter } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) { }

  getAll(filter?: PaymentFilter): Observable<ApiResponse<Payment[]>> {
    let params = new HttpParams();
    if (filter) {
      if (filter.status) params = params.set('status', filter.status);
      if (filter.payment_method) params = params.set('payment_method', filter.payment_method);
      if (filter.contract_id) params = params.set('contract_id', filter.contract_id.toString());
      if (filter.tenant_id) params = params.set('tenant_id', filter.tenant_id.toString());
      // Soportar ambos formatos de fechas
      if (filter.start_date) params = params.set('start_date', filter.start_date);
      if (filter.date_from) params = params.set('date_from', filter.date_from);
      if (filter.end_date) params = params.set('end_date', filter.end_date);
      if (filter.date_to) params = params.set('date_to', filter.date_to);
    }
    return this.http.get<ApiResponse<Payment[]>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${this.apiUrl}/${id}`);
  }

  create(payment: Partial<Payment>): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(this.apiUrl, payment);
  }

  update(id: number, payment: Partial<Payment>): Observable<ApiResponse<Payment>> {
    return this.http.put<ApiResponse<Payment>>(`${this.apiUrl}/${id}`, payment);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getByUnitId(unitId: number, limit: number = 12): Observable<ApiResponse<Payment[]>> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ApiResponse<Payment[]>>(`${this.apiUrl}/unit/${unitId}`, { params });
  }

  getTransactions(paymentId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${paymentId}/transactions`);
  }

  createTransaction(transaction: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/transactions`, transaction);
  }

  // ========== Comprobantes ==========
  uploadReceipts(paymentId: number, files: File[]): Observable<ApiResponse<any>> {
    const formData = new FormData();
    files.forEach(file => formData.append('receipts', file));
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${paymentId}/receipts`, formData);
  }

  getReceipts(paymentId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${paymentId}/receipts`);
  }

  downloadReceipt(receiptId: number): string {
    return `${environment.apiUrl}/payments/receipts/${receiptId}/download`;
  }

  deleteReceipt(receiptId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/payments/receipts/${receiptId}`);
  }
}
