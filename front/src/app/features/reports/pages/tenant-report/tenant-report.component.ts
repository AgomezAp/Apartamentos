import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';
import { ReportTableComponent, TableColumn } from '../../components/report-table/report-table.component';
import { ExportButtonsComponent } from '../../components/export-buttons/export-buttons.component';
import { ChartViewerComponent } from '../../components/chart-viewer/chart-viewer.component';
import { ChartData, DEFAULT_CHART_COLORS } from '../../models/report.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-tenant-report',
  standalone: true,
  imports: [
    CommonModule,
    ReportTableComponent,
    ExportButtonsComponent,
    ChartViewerComponent,
    CurrencyFormatPipe
  ],
  templateUrl: './tenant-report.component.html',
  styleUrl: './tenant-report.component.css'
})
export class TenantReportComponent implements OnInit {
  loading = false;
  tenantData: any[] = [];
  chartData?: ChartData;

  tableColumns: TableColumn[] = [
    { key: 'tenant_name', label: 'Inquilino', type: 'text' },
    { key: 'unit_number', label: 'Unidad', type: 'text' },
    { key: 'contract_start', label: 'Inicio Contrato', type: 'date' },
    { key: 'contract_end', label: 'Fin Contrato', type: 'date' },
    { key: 'monthly_rent', label: 'Renta Mensual', type: 'currency', align: 'right' },
    { key: 'payment_status', label: 'Estado Pago', type: 'text', align: 'center' },
    { key: 'total_paid', label: 'Total Pagado', type: 'currency', align: 'right' }
  ];

  summary = {
    totalTenants: 0,
    activeTenants: 0,
    totalMonthlyRent: 0,
    totalPaid: 0,
    currentTenants: 0,
    expiringSoon: 0
  };

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadTenantReport();
  }

  loadTenantReport(): void {
    this.loading = true;

    // Simulated data - replace with actual API call
    setTimeout(() => {
      this.tenantData = [
        {
          tenant_name: 'Juan Pérez',
          unit_number: 'A-101',
          contract_start: '2024-01-01',
          contract_end: '2025-12-31',
          monthly_rent: 1200,
          payment_status: 'Al día',
          total_paid: 14400,
          status: 'active'
        },
        {
          tenant_name: 'María García',
          unit_number: 'B-205',
          contract_start: '2024-03-15',
          contract_end: '2025-03-14',
          monthly_rent: 1500,
          payment_status: 'Al día',
          total_paid: 13500,
          status: 'active'
        },
        {
          tenant_name: 'Carlos López',
          unit_number: 'C-302',
          contract_start: '2024-06-01',
          contract_end: '2026-05-31',
          monthly_rent: 1000,
          payment_status: 'Pendiente',
          total_paid: 6000,
          status: 'active'
        },
        {
          tenant_name: 'Ana Martínez',
          unit_number: 'A-203',
          contract_start: '2023-09-01',
          contract_end: '2025-08-31',
          monthly_rent: 1350,
          payment_status: 'Al día',
          total_paid: 18900,
          status: 'active'
        },
        {
          tenant_name: 'Luis Rodríguez',
          unit_number: 'B-104',
          contract_start: '2024-02-01',
          contract_end: '2025-01-31',
          monthly_rent: 1100,
          payment_status: 'Al día',
          total_paid: 12100,
          status: 'expiring_soon'
        }
      ];

      this.calculateSummary();
      this.generateChart();
      this.loading = false;
    }, 500);
  }

  calculateSummary(): void {
    this.summary.totalTenants = this.tenantData.length;
    this.summary.activeTenants = this.tenantData.filter(t => t.status === 'active').length;
    this.summary.expiringSoon = this.tenantData.filter(t => t.status === 'expiring_soon').length;
    this.summary.totalMonthlyRent = this.tenantData.reduce((sum, t) => sum + t.monthly_rent, 0);
    this.summary.totalPaid = this.tenantData.reduce((sum, t) => sum + t.total_paid, 0);
    this.summary.currentTenants = this.tenantData.filter(t => 
      t.payment_status === 'Al día'
    ).length;
  }

  generateChart(): void {
    const currentCount = this.tenantData.filter(t => t.payment_status === 'Al día').length;
    const pendingCount = this.tenantData.filter(t => t.payment_status === 'Pendiente').length;
    const overdueCount = this.tenantData.filter(t => t.payment_status === 'Vencido').length;

    this.chartData = {
      type: 'doughnut',
      labels: ['Al día', 'Pendiente', 'Vencido'],
      datasets: [{
        data: [currentCount, pendingCount, overdueCount],
        backgroundColor: [
          DEFAULT_CHART_COLORS.success,
          DEFAULT_CHART_COLORS.warning,
          DEFAULT_CHART_COLORS.danger
        ]
      }]
    };
  }

}
