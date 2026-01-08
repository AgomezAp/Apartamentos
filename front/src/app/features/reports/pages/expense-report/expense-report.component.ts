import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';
import { ReportFilterComponent } from '../../components/report-filter/report-filter.component';
import { ChartViewerComponent } from '../../components/chart-viewer/chart-viewer.component';
import { ReportTableComponent, TableColumn } from '../../components/report-table/report-table.component';
import { ExportButtonsComponent } from '../../components/export-buttons/export-buttons.component';
import { ChartData, DEFAULT_CHART_COLORS, ReportFilter } from '../../models';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-expense-report',
  standalone: true,
  imports: [
    CommonModule,
    ReportFilterComponent,
    ChartViewerComponent,
    ReportTableComponent,
    ExportButtonsComponent,
    CurrencyFormatPipe
  ],
  templateUrl: './expense-report.component.html',
  styleUrl: './expense-report.component.css'
})
export class ExpenseReportComponent implements OnInit {
  loading = false;
  expenses: any[] = [];
  chartData?: ChartData;
  filter: ReportFilter = {};

  tableColumns: TableColumn[] = [
    { key: 'category', label: 'Categoría', type: 'text' },
    { key: 'count', label: 'Cantidad', type: 'number', align: 'center' },
    { key: 'total', label: 'Total', type: 'currency', align: 'right' },
    { key: 'average', label: 'Promedio', type: 'currency', align: 'right' }
  ];

  summary = {
    total: 0,
    count: 0,
    average: 0,
    byCategory: [] as any[]
  };

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadExpenseReport();
  }

  setDefaultDates(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.filter.start_date = firstDay.toISOString().split('T')[0];
    this.filter.end_date = lastDay.toISOString().split('T')[0];
  }

  loadExpenseReport(): void {
    if (!this.filter.start_date || !this.filter.end_date) {
      return;
    }

    this.loading = true;

    // Simulated data - replace with actual API call
    setTimeout(() => {
      this.expenses = [
        { category: 'Mantenimiento', count: 15, total: 5000, average: 333.33 },
        { category: 'Servicios', count: 12, total: 3600, average: 300 },
        { category: 'Administración', count: 8, total: 2400, average: 300 },
        { category: 'Reparaciones', count: 5, total: 1500, average: 300 },
        { category: 'Otros', count: 3, total: 900, average: 300 }
      ];

      this.calculateSummary();
      this.generateChartData();
      this.loading = false;
    }, 500);
  }

  onFilterChange(filter: ReportFilter): void {
    this.filter = filter;
    this.loadExpenseReport();
  }

  calculateSummary(): void {
    this.summary.total = this.expenses.reduce((sum, e) => sum + e.total, 0);
    this.summary.count = this.expenses.reduce((sum, e) => sum + e.count, 0);
    this.summary.average = this.summary.count > 0 ? this.summary.total / this.summary.count : 0;
    this.summary.byCategory = this.expenses;
  }

  generateChartData(): void {
    this.chartData = {
      type: 'doughnut',
      labels: this.expenses.map(e => e.category),
      datasets: [{
        data: this.expenses.map(e => e.total),
        backgroundColor: DEFAULT_CHART_COLORS.palette
      }]
    };
  }
}
