import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-report-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-table.component.html',
  styleUrl: './report-table.component.css'
})
export class ReportTableComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() title: string = '';
  @Input() showTotals: boolean = false;
  @Input() loading: boolean = false;

  displayData: any[] = [];
  totals: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['columns']) {
      this.processData();
    }
  }

  processData(): void {
    this.displayData = this.data;
    
    if (this.showTotals && this.data.length > 0) {
      this.calculateTotals();
    }
  }

  calculateTotals(): void {
    this.totals = {};
    
    this.columns.forEach(col => {
      if (col.type === 'number' || col.type === 'currency') {
        this.totals[col.key] = this.data.reduce((sum, row) => {
          const value = this.getNestedValue(row, col.key);
          return sum + (parseFloat(value) || 0);
        }, 0);
      }
    });
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  formatValue(value: any, column: TableColumn): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    switch (column.type) {
      case 'currency':
        return new CurrencyFormatPipe().transform(value);
      case 'number':
        return this.formatNumber(value);
      case 'date':
        return new DateFormatPipe().transform(value, 'dd/MM/yyyy');
      case 'percentage':
        return `${parseFloat(value).toFixed(2)}%`;
      default:
        return value.toString();
    }
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-ES').format(value);
  }
}

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'date' | 'percentage';
  align?: 'left' | 'center' | 'right';
}
