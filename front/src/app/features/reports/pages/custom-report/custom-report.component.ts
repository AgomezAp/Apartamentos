import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { ReportFilterComponent } from '../../components/report-filter/report-filter.component';
import { ChartViewerComponent } from '../../components/chart-viewer/chart-viewer.component';
import { ReportTableComponent, TableColumn } from '../../components/report-table/report-table.component';
import { ExportButtonsComponent } from '../../components/export-buttons/export-buttons.component';
import { ChartData, DEFAULT_CHART_COLORS, ReportTypes } from '../../models';

@Component({
  selector: 'app-custom-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportFilterComponent,
    ChartViewerComponent,
    ReportTableComponent,
    ExportButtonsComponent
  ],
  templateUrl: './custom-report.component.html',
  styleUrl: './custom-report.component.css'
})
export class CustomReportComponent implements OnInit {
  configForm: FormGroup;
  reportTypes = ReportTypes;
  loading = false;
  reportData: any[] = [];
  chartData?: ChartData;
  tableColumns: TableColumn[] = [];
  selectedReportType: string = '';

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService
  ) {
    this.configForm = this.fb.group({
      report_type: ['', Validators.required],
      start_date: [this.getFirstDayOfMonth(), Validators.required],
      end_date: [this.getLastDayOfMonth(), Validators.required],
      group_by: ['month'],
      include_details: [true]
    });
  }

  ngOnInit(): void {}

  onGenerateReport(): void {
    if (this.configForm.invalid) {
      return;
    }

    this.loading = true;
    this.selectedReportType = this.configForm.value.report_type;
    const params = this.configForm.value;

    this.reportService.generate(params.report_type, params).subscribe({
      next: (response) => {
        this.reportData = response.data || [];
        this.setupTableColumns(params.report_type);
        this.setupChartData(params.report_type);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating report:', error);
        alert('Error al generar el reporte');
        this.loading = false;
      }
    });
  }

  setupTableColumns(reportType: string): void {
    switch (reportType) {
      case 'financial':
        this.tableColumns = [
          { key: 'period', label: 'Período', type: 'text' },
          { key: 'income.total', label: 'Ingresos', type: 'currency', align: 'right' },
          { key: 'expenses.total', label: 'Gastos', type: 'currency', align: 'right' },
          { key: 'net', label: 'Neto', type: 'currency', align: 'right' }
        ];
        break;
      case 'occupancy':
        this.tableColumns = [
          { key: 'building_name', label: 'Edificio', type: 'text' },
          { key: 'total_units', label: 'Total Unidades', type: 'number', align: 'center' },
          { key: 'occupied_units', label: 'Ocupadas', type: 'number', align: 'center' },
          { key: 'occupancy_rate', label: 'Tasa (%)', type: 'percentage', align: 'right' }
        ];
        break;
      case 'payment':
        this.tableColumns = [
          { key: 'period', label: 'Período', type: 'text' },
          { key: 'total_expected', label: 'Esperado', type: 'currency', align: 'right' },
          { key: 'total_collected', label: 'Cobrado', type: 'currency', align: 'right' },
          { key: 'collection_rate', label: 'Tasa (%)', type: 'percentage', align: 'right' }
        ];
        break;
      default:
        this.tableColumns = [];
    }
  }

  setupChartData(reportType: string): void {
    if (this.reportData.length === 0) {
      this.chartData = undefined;
      return;
    }

    switch (reportType) {
      case 'financial':
        this.chartData = {
          type: 'bar',
          labels: this.reportData.map(d => d.period),
          datasets: [
            {
              label: 'Ingresos',
              data: this.reportData.map(d => d.income?.total || 0),
              backgroundColor: DEFAULT_CHART_COLORS.success
            },
            {
              label: 'Gastos',
              data: this.reportData.map(d => d.expenses?.total || 0),
              backgroundColor: DEFAULT_CHART_COLORS.danger
            }
          ]
        };
        break;
      case 'occupancy':
        this.chartData = {
          type: 'pie',
          labels: ['Ocupadas', 'Vacantes'],
          datasets: [{
            data: [
              this.reportData.reduce((sum, d) => sum + (d.occupied_units || 0), 0),
              this.reportData.reduce((sum, d) => sum + (d.vacant_units || 0), 0)
            ],
            backgroundColor: [DEFAULT_CHART_COLORS.success, DEFAULT_CHART_COLORS.warning]
          }]
        };
        break;
      default:
        this.chartData = undefined;
    }
  }

  getFirstDayOfMonth(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  }

  getLastDayOfMonth(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  }
}
