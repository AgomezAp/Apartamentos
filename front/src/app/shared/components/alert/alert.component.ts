import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent implements OnInit {
  @Input() type: AlertType = 'info';
  @Input() message: string = '';
  @Input() title?: string;
  @Input() dismissible: boolean = true;
  @Input() autoClose: boolean = false;
  @Input() autoCloseTime: number = 5000; // 5 segundos
  @Output() closed = new EventEmitter<void>();

  isVisible: boolean = true;
  private autoCloseTimer?: any;

  ngOnInit(): void {
    if (this.autoClose) {
      this.autoCloseTimer = setTimeout(() => {
        this.close();
      }, this.autoCloseTime);
    }
  }

  ngOnDestroy(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
  }

  close(): void {
    this.isVisible = false;
    this.closed.emit();
  }

  getIcon(): string {
    const icons: Record<AlertType, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[this.type];
  }

  getDefaultTitle(): string {
    const titles: Record<AlertType, string> = {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información'
    };
    return this.title || titles[this.type];
  }
}
