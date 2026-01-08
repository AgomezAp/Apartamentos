import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { RevenueData } from '../../models/dashboard.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-revenue-chart',
  imports: [CommonModule, FormsModule, CurrencyFormatPipe],
  templateUrl: './revenue-chart.component.html',
  styleUrl: './revenue-chart.component.css'
})
export class RevenueChartComponent implements OnInit, OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  
  revenueData: RevenueData[] = [];
  loading = false;
  error = '';
  months = 6;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadRevenueData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['startDate'] || changes['endDate']) && !changes['startDate']?.firstChange) {
      this.loadRevenueData();
    }
  }

  loadRevenueData(): void {
    this.loading = true;
    this.error = '';
    
    // Si hay fechas del filtro, usar esas; si no, usar el selector de meses
    if (this.startDate && this.endDate) {
      this.loadRevenueByPeriod();
    } else {
      this.loadRevenueByMonths();
    }
  }

  loadRevenueByMonths(): void {
    this.dashboardService.getRevenueByMonth(this.months).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.revenueData = response.data.reverse();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar datos de ingresos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadRevenueByPeriod(): void {
    // Este método necesitaría un nuevo endpoint en el backend
    // Por ahora, usamos el de meses pero en el futuro debería filtrar por período
    this.dashboardService.getRevenueByMonth(this.months).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.revenueData = response.data.reverse();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar datos de ingresos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getMaxRevenue(): number {
    if (this.revenueData.length === 0) return 0;
    return Math.max(...this.revenueData.map(d => d.expected_revenue));
  }

  getBarHeight(amount: number): string {
    const max = this.getMaxRevenue();
    if (max === 0) return '0%';
    return `${(amount / max) * 100}%`;
  }

  formatMonth(month: string): string {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthIndex = parseInt(month.split('-')[1]) - 1;
    return months[monthIndex];
  }

  getTotalExpected(): number {
    return this.revenueData.reduce((sum, d) => sum + d.expected_revenue, 0);
  }

  getTotalCollected(): number {
    return this.revenueData.reduce((sum, d) => sum + d.collected_revenue, 0);
  }

  getTotalPending(): number {
    return this.revenueData.reduce((sum, d) => sum + d.pending_revenue, 0);
  }

  getAverageCollectionRate(): number {
    if (this.revenueData.length === 0) return 0;
    const sum = this.revenueData.reduce((total, d) => total + d.collection_rate, 0);
    return sum / this.revenueData.length;
  }
}
