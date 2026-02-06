/**
 * 📱 Servicio de WhatsApp
 * Maneja la comunicación con el backend para WhatsApp
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { switchMap, takeWhile, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api.model';

export interface WhatsAppStatus {
  isConnected: boolean;
  isReady: boolean;
  qrCode: string | null;
  lastConnection: Date | null;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private apiUrl = `${environment.apiUrl}/whatsapp`;
  private statusSubject = new BehaviorSubject<WhatsAppStatus | null>(null);
  
  status$ = this.statusSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Conectar WhatsApp (genera el código QR)
   */
  connect(): Observable<ApiResponse<WhatsAppStatus>> {
    return this.http.post<ApiResponse<WhatsAppStatus>>(`${this.apiUrl}/connect`, {});
  }

  /**
   * Obtener estado de conexión
   */
  getStatus(): Observable<ApiResponse<WhatsAppStatus>> {
    return this.http.get<ApiResponse<WhatsAppStatus>>(`${this.apiUrl}/status`).pipe(
      tap(response => {
        if (response.data) {
          this.statusSubject.next(response.data);
        }
      })
    );
  }

  /**
   * Obtener código QR
   */
  getQR(): Observable<ApiResponse<{ qrCode: string | null; isConnected: boolean }>> {
    return this.http.get<ApiResponse<{ qrCode: string | null; isConnected: boolean }>>(`${this.apiUrl}/qr`);
  }

  /**
   * Desconectar WhatsApp
   */
  disconnect(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/disconnect`, {});
  }

  /**
   * Enviar mensaje de prueba
   */
  sendTestMessage(phone: string, message: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/test`, { phone, message });
  }

  /**
   * Enviar confirmación de pago
   */
  sendPaymentConfirmation(data: {
    phone: string;
    tenantName: string;
    amount: number;
    unitNumber: string;
    buildingName: string;
    paymentDate: string;
    referenceNumber?: string;
  }): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/payment-confirmation`, data);
  }

  /**
   * Enviar recordatorio de pago
   */
  sendPaymentReminder(data: {
    phone: string;
    tenantName: string;
    amount: number;
    unitNumber: string;
    buildingName: string;
    dueDate: string;
    daysUntilDue: number;
  }): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/payment-reminder`, data);
  }

  /**
   * Enviar alerta de prueba al administrador
   */
  sendTestAlert(): Observable<ApiResponse<{ adminPhone: string }>> {
    return this.http.post<ApiResponse<{ adminPhone: string }>>(`${this.apiUrl}/test-alert`, {});
  }

  /**
   * Ejecutar verificación de alertas manualmente
   */
  runAlerts(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/run-alerts`, {});
  }

  /**
   * Polling para actualizar estado mientras se espera conexión
   */
  startPolling(): Observable<WhatsAppStatus> {
    return interval(3000).pipe(
      switchMap(() => this.getStatus()),
      takeWhile(response => !response.data?.isReady, true),
      switchMap(response => {
        if (response.data) {
          return [response.data];
        }
        return [];
      })
    );
  }
}
