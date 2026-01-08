import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  imports: [CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.css'
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = 0;
  @Input() icon: string = '📊';
  @Input() color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' = 'blue';
  @Input() trend?: number;
  @Input() trendLabel?: string;
  @Input() subtitle?: string;

  get colorClass(): string {
    return `color-${this.color}`;
  }

  get trendClass(): string {
    if (!this.trend) return '';
    return this.trend > 0 ? 'trend-up' : 'trend-down';
  }

  get trendIcon(): string {
    if (!this.trend) return '';
    return this.trend > 0 ? '↑' : '↓';
  }
}
