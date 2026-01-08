import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportFilter, ReportTypes } from '../../models';

@Component({
  selector: 'app-report-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-filter.component.html',
  styleUrl: './report-filter.component.css'
})
export class ReportFilterComponent implements OnInit {
  @Input() buildings: any[] = [];
  @Input() units: any[] = [];
  @Input() tenants: any[] = [];
  @Input() showBuildingFilter: boolean = true;
  @Input() showUnitFilter: boolean = true;
  @Input() showTenantFilter: boolean = true;
  @Input() showReportTypeFilter: boolean = true;
  @Input() showDateFilters: boolean = true;
  @Input() showStatusFilter: boolean = false;
  
  @Output() filterChange = new EventEmitter<ReportFilter>();
  @Output() clear = new EventEmitter<void>();

  filter: ReportFilter = {};
  reportTypes = ReportTypes;

  ngOnInit(): void {
    // Set default date range (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.filter.start_date = firstDay.toISOString().split('T')[0];
    this.filter.end_date = lastDay.toISOString().split('T')[0];
  }

  onApplyFilter(): void {
    this.filterChange.emit(this.filter);
  }

  onClearFilter(): void {
    this.filter = {};
    
    // Reset to default date range
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.filter.start_date = firstDay.toISOString().split('T')[0];
    this.filter.end_date = lastDay.toISOString().split('T')[0];
    
    this.clear.emit();
    this.filterChange.emit(this.filter);
  }
}
