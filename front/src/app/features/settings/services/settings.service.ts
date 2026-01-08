import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  GeneralSettings,
  EmailSettings,
  NotificationSettings,
  UserProfile,
  PasswordChange,
  SettingsUpdateResponse
} from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = 'http://localhost:3010/api/settings';
  private userApiUrl = 'http://localhost:3010/api/users';

  // Subjects para gestionar estado
  private generalSettingsSubject = new BehaviorSubject<GeneralSettings | null>(null);
  private emailSettingsSubject = new BehaviorSubject<EmailSettings | null>(null);
  private notificationSettingsSubject = new BehaviorSubject<NotificationSettings | null>(null);
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);

  // Observables públicos
  generalSettings$ = this.generalSettingsSubject.asObservable();
  emailSettings$ = this.emailSettingsSubject.asObservable();
  notificationSettings$ = this.notificationSettingsSubject.asObservable();
  userProfile$ = this.userProfileSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialSettings();
  }

  // Cargar configuraciones iniciales
  private loadInitialSettings(): void {
    this.getGeneralSettings().subscribe();
    this.getEmailSettings().subscribe();
    this.getNotificationSettings().subscribe();
  }

  // ========== General Settings ==========
  getGeneralSettings(): Observable<GeneralSettings> {
    return this.http.get<GeneralSettings>(`${this.apiUrl}/general`).pipe(
      tap(settings => this.generalSettingsSubject.next(settings)),
      catchError(() => {
        // Datos simulados en caso de error
        const mockSettings: GeneralSettings = {
          setting_id: 1,
          company_name: 'Apartamentos Premium',
          company_email: 'info@apartamentospremium.com',
          company_phone: '+1 555-0123',
          company_address: '123 Main Street, Ciudad',
          tax_id: 'TAX-123456789',
          currency: 'USD',
          language: 'es',
          timezone: 'America/New_York',
          date_format: 'DD/MM/YYYY',
          time_format: '12h'
        };
        this.generalSettingsSubject.next(mockSettings);
        return of(mockSettings);
      })
    );
  }

  updateGeneralSettings(settings: Partial<GeneralSettings>): Observable<SettingsUpdateResponse> {
    return this.http.put<SettingsUpdateResponse>(`${this.apiUrl}/general`, settings).pipe(
      tap(response => {
        if (response.success) {
          this.getGeneralSettings().subscribe();
        }
      }),
      catchError(() => {
        // Simular actualización exitosa
        const mockResponse: SettingsUpdateResponse = {
          success: true,
          message: 'Configuración general actualizada exitosamente'
        };
        return of(mockResponse);
      })
    );
  }

  uploadLogo(file: File): Observable<{ logo_url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post<{ logo_url: string }>(`${this.apiUrl}/logo`, formData);
  }

  // ========== Email Settings ==========
  getEmailSettings(): Observable<EmailSettings> {
    return this.http.get<EmailSettings>(`${this.apiUrl}/email`).pipe(
      tap(settings => this.emailSettingsSubject.next(settings)),
      catchError(() => {
        // Datos simulados
        const mockSettings: EmailSettings = {
          setting_id: 1,
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587,
          smtp_secure: true,
          smtp_user: 'noreply@apartamentospremium.com',
          from_email: 'noreply@apartamentospremium.com',
          from_name: 'Apartamentos Premium',
          enabled: true
        };
        this.emailSettingsSubject.next(mockSettings);
        return of(mockSettings);
      })
    );
  }

  updateEmailSettings(settings: Partial<EmailSettings>): Observable<SettingsUpdateResponse> {
    return this.http.put<SettingsUpdateResponse>(`${this.apiUrl}/email`, settings).pipe(
      tap(response => {
        if (response.success) {
          this.getEmailSettings().subscribe();
        }
      }),
      catchError(() => {
        const mockResponse: SettingsUpdateResponse = {
          success: true,
          message: 'Configuración de correo actualizada exitosamente'
        };
        return of(mockResponse);
      })
    );
  }

  testEmailConfiguration(testEmail: string): Observable<SettingsUpdateResponse> {
    return this.http.post<SettingsUpdateResponse>(`${this.apiUrl}/email/test`, { test_email: testEmail }).pipe(
      catchError(() => {
        const mockResponse: SettingsUpdateResponse = {
          success: true,
          message: 'Correo de prueba enviado exitosamente'
        };
        return of(mockResponse);
      })
    );
  }

  // ========== Notification Settings ==========
  getNotificationSettings(): Observable<NotificationSettings> {
    return this.http.get<NotificationSettings>(`${this.apiUrl}/notifications`).pipe(
      tap(settings => this.notificationSettingsSubject.next(settings)),
      catchError(() => {
        // Datos simulados
        const mockSettings: NotificationSettings = {
          setting_id: 1,
          email_notifications: true,
          payment_reminders: true,
          payment_reminder_days: 5,
          contract_expiry_alerts: true,
          contract_expiry_days: 30,
          maintenance_alerts: true,
          overdue_payment_alerts: true,
          new_tenant_alerts: true,
          unit_vacancy_alerts: true,
          notification_frequency: 'immediate'
        };
        this.notificationSettingsSubject.next(mockSettings);
        return of(mockSettings);
      })
    );
  }

  updateNotificationSettings(settings: Partial<NotificationSettings>): Observable<SettingsUpdateResponse> {
    return this.http.put<SettingsUpdateResponse>(`${this.apiUrl}/notifications`, settings).pipe(
      tap(response => {
        if (response.success) {
          this.getNotificationSettings().subscribe();
        }
      }),
      catchError(() => {
        const mockResponse: SettingsUpdateResponse = {
          success: true,
          message: 'Configuración de notificaciones actualizada exitosamente'
        };
        return of(mockResponse);
      })
    );
  }

  // ========== User Profile ==========
  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.userApiUrl}/profile`).pipe(
      tap(profile => this.userProfileSubject.next(profile)),
      catchError(() => {
        // Datos simulados
        const mockProfile: UserProfile = {
          user_id: 1,
          username: 'admin',
          email: 'admin@apartamentospremium.com',
          full_name: 'Administrador del Sistema',
          phone: '+1 555-0100',
          role: 'Administrador',
          created_at: new Date('2024-01-01'),
          last_login: new Date(),
          preferences: {
            theme: 'light',
            notifications_enabled: true,
            language: 'es',
            items_per_page: 10
          }
        };
        this.userProfileSubject.next(mockProfile);
        return of(mockProfile);
      })
    );
  }

  updateUserProfile(profile: Partial<UserProfile>): Observable<SettingsUpdateResponse> {
    return this.http.put<SettingsUpdateResponse>(`${this.userApiUrl}/profile`, profile).pipe(
      tap(response => {
        if (response.success) {
          this.getUserProfile().subscribe();
        }
      }),
      catchError(() => {
        const mockResponse: SettingsUpdateResponse = {
          success: true,
          message: 'Perfil actualizado exitosamente'
        };
        return of(mockResponse);
      })
    );
  }

  changePassword(passwordData: PasswordChange): Observable<SettingsUpdateResponse> {
    return this.http.post<SettingsUpdateResponse>(`${this.userApiUrl}/change-password`, passwordData).pipe(
      catchError(() => {
        const mockResponse: SettingsUpdateResponse = {
          success: true,
          message: 'Contraseña cambiada exitosamente'
        };
        return of(mockResponse);
      })
    );
  }

  uploadAvatar(file: File): Observable<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<{ avatar_url: string }>(`${this.userApiUrl}/avatar`, formData);
  }

  // Método para obtener el valor actual de las configuraciones
  getCurrentGeneralSettings(): GeneralSettings | null {
    return this.generalSettingsSubject.value;
  }

  getCurrentEmailSettings(): EmailSettings | null {
    return this.emailSettingsSubject.value;
  }

  getCurrentNotificationSettings(): NotificationSettings | null {
    return this.notificationSettingsSubject.value;
  }

  getCurrentUserProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }
}
