import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { 
  NotificationService, 
  Notification, 
  NotificationType 
} from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      <div 
        *ngFor="let notification of notifications; trackBy: trackById"
        class="toast toast-{{ notification.type }}"
        role="alert"
      >
        <div class="toast-icon">
          <span>{{ getIcon(notification.type) }}</span>
        </div>
        <div class="toast-content">
          <strong class="toast-title">{{ notification.title }}</strong>
          <p class="toast-message">{{ notification.message }}</p>
        </div>
        <button 
          *ngIf="notification.dismissible"
          class="toast-close" 
          (click)="dismiss(notification.id)"
          aria-label="Cerrar notificación"
          type="button"
        >
          ×
        </button>
        <div 
          class="toast-progress" 
          [style.animation-duration.ms]="notification.duration"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      min-width: 320px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12), 0 3px 6px rgba(0, 0, 0, 0.08);
      background: white;
      pointer-events: auto;
      animation: toastSlideIn 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
      position: relative;
      overflow: hidden;
    }

    @keyframes toastSlideIn {
      0% {
        transform: translateX(120%);
        opacity: 0;
      }
      100% {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      border-left: 5px solid #10b981;
      background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%);
    }

    .toast-error {
      border-left: 5px solid #ef4444;
      background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
    }

    .toast-warning {
      border-left: 5px solid #f59e0b;
      background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
    }

    .toast-info {
      border-left: 5px solid #3b82f6;
      background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
    }

    .toast-icon {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 14px;
      font-size: 14px;
      font-weight: bold;
    }

    .toast-success .toast-icon {
      background: #10b981;
      color: white;
    }

    .toast-error .toast-icon {
      background: #ef4444;
      color: white;
    }

    .toast-warning .toast-icon {
      background: #f59e0b;
      color: white;
    }

    .toast-info .toast-icon {
      background: #3b82f6;
      color: white;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
      padding-right: 8px;
    }

    .toast-title {
      display: block;
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
      line-height: 1.3;
    }

    .toast-message {
      font-size: 13px;
      color: #4b5563;
      margin: 0;
      line-height: 1.5;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .toast-close {
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      font-size: 18px;
      color: #9ca3af;
      cursor: pointer;
      padding: 4px 8px;
      line-height: 1;
      transition: all 0.2s ease;
      border-radius: 4px;
    }

    .toast-close:hover {
      color: #374151;
      background: rgba(0, 0, 0, 0.05);
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 4px;
      width: 100%;
      animation: progressShrink linear forwards;
    }

    @keyframes progressShrink {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    .toast-success .toast-progress {
      background: linear-gradient(90deg, #10b981, #34d399);
    }

    .toast-error .toast-progress {
      background: linear-gradient(90deg, #ef4444, #f87171);
    }

    .toast-warning .toast-progress {
      background: linear-gradient(90deg, #f59e0b, #fbbf24);
    }

    .toast-info .toast-progress {
      background: linear-gradient(90deg, #3b82f6, #60a5fa);
    }

    /* Responsive */
    @media (max-width: 480px) {
      .toast-container {
        left: 10px;
        right: 10px;
        max-width: none;
        min-width: auto;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription!: Subscription;

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🍞 ToastComponent inicializado');
    this.subscription = this.notificationService.notifications$.subscribe(
      (notifications) => {
        console.log('🍞 ToastComponent - Recibiendo notificaciones:', notifications.length, notifications);
        this.notifications = notifications;
        this.cdr.detectChanges(); // Forzar detección de cambios
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  trackById(index: number, notification: Notification): string {
    return notification.id;
  }

  getIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      [NotificationType.SUCCESS]: '✓',
      [NotificationType.ERROR]: '✕',
      [NotificationType.WARNING]: '⚠',
      [NotificationType.INFO]: 'ℹ'
    };
    return icons[type];
  }

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}
