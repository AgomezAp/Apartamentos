import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';
import { ReportFilterComponent } from '../../components/report-filter/report-filter.component';
import { ChartViewerComponent } from '../../components/chart-viewer/chart-viewer.component';
import { ReportTableComponent, TableColumn } from '../../components/report-table/report-table.component';
import { ExportButtonsComponent } from '../../components/export-buttons/export-buttons.component';
import { ReportFilter, PaymentReport, ChartData, DEFAULT_CHART_COLORS } from '../../models/report.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-payment-report',
  standalone: true,
  imports: [
    CommonModule,
    ReportFilterComponent,
    ChartViewerComponent,
    ReportTableComponent,
    ExportButtonsComponent,
    CurrencyFormatPipe
  ],
  templateUrl: './payment-report.component.html',
  styleUrl: './payment-report.component.css'
})
export class PaymentReportComponent implements OnInit {
  loading = false;
  paymentData: PaymentReport[] = [];
  chartData?: ChartData;
  statusChartData?: ChartData;
  filter: ReportFilter = {};

  tableColumns: TableColumn[] = [
    { key: 'period', label: 'Período', type: 'text' },
    { key: 'total_expected', label: 'Esperado', type: 'currency', align: 'right' },
    { key: 'total_collected', label: 'Cobrado', type: 'currency', align: 'right' },
    { key: 'total_pending', label: 'Pendiente', type: 'currency', align: 'right' },
    { key: 'total_overdue', label: 'Vencido', type: 'currency', align: 'right' },
    { key: 'collection_rate', label: 'Tasa de Cobro', type: 'percentage', align: 'right' }
  ];

  summary = {
    totalExpected: 0,
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    collectionRate: 0
  };

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadPaymentReport();
  }

  setDefaultDates(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.filter.start_date = firstDay.toISOString().split('T')[0];
    this.filter.end_date = lastDay.toISOString().split('T')[0];
  }

  loadPaymentReport(): void {
    if (!this.filter.start_date || !this.filter.end_date) {
      return;
    }

    this.loading = true;

    this.reportService.getPaymentReport(
      this.filter.start_date,
      this.filter.end_date,
      this.filter.building_id
    ).subscribe({
      next: (data) => {
        this.paymentData = data;
        this.calculateSummary();
        this.generateCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading payment report:', error);
        // Simulated data for demo
        this.paymentData = [
          {
            period: 'Enero 2025',
            total_expected: 50000,
            total_collected: 45000,
            total_pending: 3000,
            total_overdue: 2000,
            collection_rate: 90,
            payments_by_status: [
              { status: 'completed', amount: 45000, count: 45 },
              { status: 'pending', amount: 3000, count: 3 },
              { status: 'overdue', amount: 2000, count: 2 }
            ]
          },
          {
            period: 'Diciembre 2024',
            total_expected: 48000,
            total_collected: 46000,
            total_pending: 1000,
            total_overdue: 1000,
            collection_rate: 95.83,
            payments_by_status: [
              { status: 'completed', amount: 46000, count: 46 },
              { status: 'pending', amount: 1000, count: 1 },
              { status: 'overdue', amount: 1000, count: 1 }
            ]
          }
        ];
        this.calculateSummary();
        this.generateCharts();
        this.loading = false;
      }
    });
  }

  onFilterChange(filter: ReportFilter): void {
    this.filter = filter;
    this.loadPaymentReport();
  }

  calculateSummary(): void {
    this.summary.totalExpected = this.paymentData.reduce((sum, d) => sum + d.total_expected, 0);
    this.summary.totalCollected = this.paymentData.reduce((sum, d) => sum + d.total_collected, 0);
    this.summary.totalPending = this.paymentData.reduce((sum, d) => sum + d.total_pending, 0);
    this.summary.totalOverdue = this.paymentData.reduce((sum, d) => sum + d.total_overdue, 0);
    this.summary.collectionRate = this.summary.totalExpected > 0
      ? (this.summary.totalCollected / this.summary.totalExpected) * 100
      : 0;
  }

  generateCharts(): void {
    // Collection trend chart
    this.chartData = {
      type: 'bar',
      labels: this.paymentData.map(d => d.period),
      datasets: [
        {
          label: 'Esperado',
          data: this.paymentData.map(d => d.total_expected),
          backgroundColor: DEFAULT_CHART_COLORS.info
        },
        {
          label: 'Cobrado',
          data: this.paymentData.map(d => d.total_collected),
          backgroundColor: DEFAULT_CHART_COLORS.success
        }
      ]
    };

    // Status distribution chart
    this.statusChartData = {
      type: 'doughnut',
      labels: ['Cobrado', 'Pendiente', 'Vencido'],
      datasets: [{
        data: [
          this.summary.totalCollected,
          this.summary.totalPending,
          this.summary.totalOverdue
        ],
        backgroundColor: [
          DEFAULT_CHART_COLORS.success,
          DEFAULT_CHART_COLORS.warning,
          DEFAULT_CHART_COLORS.danger
        ]
      }]
    };
  }

}
