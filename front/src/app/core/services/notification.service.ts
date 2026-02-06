import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Tipo de notificación
 */
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Interfaz de Notificación
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Subject para las notificaciones activas
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();
  
  // Duración por defecto (en milisegundos)
  private readonly DEFAULT_DURATION = 5000;

  constructor() { }

  /**
   * Mostrar notificación de éxito
   */
  showSuccess(message: string, title: string = 'Éxito', duration?: number): void {
    this.show({
      type: NotificationType.SUCCESS,
      title,
      message,
      duration: duration || this.DEFAULT_DURATION,
      dismissible: true
    });
  }

  /**
   * Mostrar notificación de error
   */
  showError(message: string, title: string = 'Error', duration?: number): void {
    this.show({
      type: NotificationType.ERROR,
      title,
      message,
      duration: duration || this.DEFAULT_DURATION,
      dismissible: true
    });
  }

  /**
   * Mostrar notificación de advertencia
   */
  showWarning(message: string, title: string = 'Advertencia', duration?: number): void {
    this.show({
      type: NotificationType.WARNING,
      title,
      message,
      duration: duration || this.DEFAULT_DURATION,
      dismissible: true
    });
  }

  /**
   * Mostrar notificación de información
   */
  showInfo(message: string, title: string = 'Información', duration?: number): void {
    this.show({
      type: NotificationType.INFO,
      title,
      message,
      duration: duration || this.DEFAULT_DURATION,
      dismissible: true
    });
  }

  /**
   * Mostrar notificación genérica
   */
  show(notification: Omit<Notification, 'id'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId()
    };

    console.log('🔔 NotificationService - Nueva notificación:', newNotification);

    // Añadir notificación a la lista
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);

    console.log('🔔 NotificationService - Total notificaciones:', this.notificationsSubject.value.length);

    // Auto-cerrar después de la duración especificada
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(newNotification.id);
      }, notification.duration);
    }
  }

  /**
   * Cerrar notificación específica
   */
  dismiss(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Cerrar todas las notificaciones
   */
  dismissAll(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Generar ID único para notificación
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mostrar confirmación (retorna Promise)
   * Puede usarse con async/await
   */
  async confirm(
    message: string,
    title: string = 'Confirmar',
    confirmText: string = 'Aceptar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    // Usando confirmación nativa del navegador por ahora
    // Se puede implementar un modal personalizado más adelante
    return confirm(`${title}\n\n${message}`);
  }
}
