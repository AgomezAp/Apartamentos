import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcumb.component.html',
  styleUrl: './breadcumb.component.css'
})
export class BreadcumbComponent {
  @Input() items: BreadcrumbItem[] = [];
  @Input() separator: string = '/';
}
