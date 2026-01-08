import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { BuildingStats } from '../../models/dashboard.model';import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
@Component({
  selector: 'app-occupancy-chart',
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './occupancy-chart.component.html',
  styleUrl: './occupancy-chart.component.css'
})
export class OccupancyChartComponent implements OnInit {
  buildingStats: BuildingStats[] = [];
  loading = false;
  error = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadOccupancyData();
  }

  loadOccupancyData(): void {
    this.loading = true;
    this.error = '';
    this.dashboardService.getStatsByBuilding().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.buildingStats = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar datos de ocupación';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getOccupancyBarWidth(rate: number): string {
    return `${rate}%`;
  }

  getOccupancyColor(rate: number): string {
    if (rate >= 90) return '#10b981';
    if (rate >= 70) return '#3b82f6';
    if (rate >= 50) return '#f59e0b';
    return '#ef4444';
  }
}
