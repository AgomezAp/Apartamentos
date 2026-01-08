import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeType = 'success' | 'error' | 'warning' | 'info' | 'default';
export type BadgeSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css'
})
export class StatusBadgeComponent {
  @Input() type: BadgeType = 'default';
  @Input() size: BadgeSize = 'medium';
  @Input() label: string = '';
  @Input() icon?: string;
  @Input() dotOnly: boolean = false;
}
