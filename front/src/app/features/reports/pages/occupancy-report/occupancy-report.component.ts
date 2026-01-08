import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';
import { ChartViewerComponent } from '../../components/chart-viewer/chart-viewer.component';
import { ReportTableComponent, TableColumn } from '../../components/report-table/report-table.component';
import { ExportButtonsComponent } from '../../components/export-buttons/export-buttons.component';
import { ChartData, DEFAULT_CHART_COLORS, OccupancyReport } from '../../models';

@Component({
  selector: 'app-occupancy-report',
  standalone: true,
  imports: [
    CommonModule,
    ChartViewerComponent,
    ReportTableComponent,
    ExportButtonsComponent
  ],
  templateUrl: './occupancy-report.component.html',
  styleUrl: './occupancy-report.component.css'
})
export class OccupancyReportComponent implements OnInit {
  loading = false;
  occupancyData: OccupancyReport[] = [];
  overallChartData?: ChartData;
  buildingChartData?: ChartData;

  tableColumns: TableColumn[] = [
    { key: 'building_name', label: 'Edificio', type: 'text' },
    { key: 'total_units', label: 'Total Unidades', type: 'number', align: 'center' },
    { key: 'occupied_units', label: 'Ocupadas', type: 'number', align: 'center' },
    { key: 'vacant_units', label: 'Vacantes', type: 'number', align: 'center' },
    { key: 'occupancy_rate', label: 'Tasa de Ocupación', type: 'percentage', align: 'right' }
  ];

  summary = {
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    occupancyRate: 0
  };

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadOccupancyReport();
  }

  loadOccupancyReport(): void {
    this.loading = true;

    this.reportService.getOccupancyReport().subscribe({
      next: (data) => {
        this.occupancyData = data;
        this.calculateSummary();
        this.generateCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading occupancy report:', error);
        // Simulated data for demo
        this.occupancyData = [
          {
            building_id: 1,
            building_name: 'Edificio Central',
            total_units: 50,
            occupied_units: 45,
            vacant_units: 5,
            occupancy_rate: 90,
            occupancy_percentage: 90,
            units_by_status: [
              { status: 'occupied', count: 45, percentage: 90 },
              { status: 'vacant', count: 5, percentage: 10 }
            ]
          },
          {
            building_id: 2,
            building_name: 'Torre Norte',
            total_units: 30,
            occupied_units: 24,
            vacant_units: 6,
            occupancy_rate: 80,
            occupancy_percentage: 80,
            units_by_status: [
              { status: 'occupied', count: 24, percentage: 80 },
              { status: 'vacant', count: 6, percentage: 20 }
            ]
          },
          {
            building_id: 3,
            building_name: 'Residencial Sur',
            total_units: 40,
            occupied_units: 38,
            vacant_units: 2,
            occupancy_rate: 95,
            occupancy_percentage: 95,
            units_by_status: [
              { status: 'occupied', count: 38, percentage: 95 },
              { status: 'vacant', count: 2, percentage: 5 }
            ]
          }
        ];
        this.calculateSummary();
        this.generateCharts();
        this.loading = false;
      }
    });
  }

  calculateSummary(): void {
    this.summary.totalUnits = this.occupancyData.reduce((sum, d) => sum + d.total_units, 0);
    this.summary.occupiedUnits = this.occupancyData.reduce((sum, d) => sum + d.occupied_units, 0);
    this.summary.vacantUnits = this.occupancyData.reduce((sum, d) => sum + d.vacant_units, 0);
    this.summary.occupancyRate = this.summary.totalUnits > 0
      ? (this.summary.occupiedUnits / this.summary.totalUnits) * 100
      : 0;
  }

  generateCharts(): void {
    // Overall occupancy pie chart
    this.overallChartData = {
      type: 'doughnut',
      labels: ['Ocupadas', 'Vacantes'],
      datasets: [{
        data: [this.summary.occupiedUnits, this.summary.vacantUnits],
        backgroundColor: [DEFAULT_CHART_COLORS.success, DEFAULT_CHART_COLORS.warning]
      }]
    };

    // Occupancy by building bar chart
    this.buildingChartData = {
      type: 'bar',
      labels: this.occupancyData.map(d => d.building_name || ''),
      datasets: [
        {
          label: 'Ocupadas',
          data: this.occupancyData.map(d => d.occupied_units),
          backgroundColor: DEFAULT_CHART_COLORS.success
        },
        {
          label: 'Vacantes',
          data: this.occupancyData.map(d => d.vacant_units),
          backgroundColor: DEFAULT_CHART_COLORS.warning
        }
      ]
    };
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }
}
