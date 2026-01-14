import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';
import { BuildingService } from '../../../buildings/services/building.service';
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
  buildings: any[] = [];

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

  constructor(private reportService: ReportService, private buildingService: BuildingService) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadExpenseReport();
    this.loadBuildings();
  }

  loadBuildings(): void {
    this.buildingService.getActiveBuildings().subscribe({
      next: (response: any) => this.buildings = response?.data || [],
      error: (err) => console.error('Error cargando edificios:', err)
    });
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

    // Llamar al backend para obtener gastos reales por rango y edificio opcional
    const buildingId = (this.filter && (this.filter as any).building_id) ? (this.filter as any).building_id : undefined;
    this.reportService.getExpensesByRange(this.filter.start_date!, this.filter.end_date!, buildingId).subscribe({
      next: (response: any) => {
        // El backend devuelve { period, summary, items }
        const items = response?.data?.items || response?.items || [];

        // Transformar a formato utilizado por el componente (agrupar por categoría)
        const grouped: Record<string, any> = {};
        items.forEach((it: any) => {
          const cat = it.category || 'Otros';
          if (!grouped[cat]) grouped[cat] = { category: cat, count: 0, total: 0 };
          grouped[cat].count += 1;
          grouped[cat].total += parseFloat(it.amount || 0);
        });

        this.expenses = Object.values(grouped).map(g => ({
          category: g.category,
          count: g.count,
          total: g.total,
          average: g.count > 0 ? g.total / g.count : 0
        }));

        this.calculateSummary();
        this.generateChartData();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading expenses report:', err);
        this.loading = false;
      }
    });
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
