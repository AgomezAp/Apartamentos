import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../models/dashboard.model';
import { StatsCardComponent } from '../../components/stats-card/stats-card.component';
import { AlertsWidgetComponent } from '../../components/alerts-widget/alerts-widget.component';
import { OccupancyChartComponent } from '../../components/occupancy-chart/occupancy-chart.component';
import { PendingTasksComponent } from '../../components/pending-tasks/pending-tasks.component';
import { RevenueChartComponent } from '../../components/revenue-chart/revenue-chart.component';
import { ExpenseTrendsChartComponent } from '../../components/expense-trends-chart/expense-trends-chart.component';
import { PaymentHistoryComponent } from '../../../payments/components/payment-history/payment-history.component';
import { OverduePaymentsComponent } from '../../../payments/components/overdue-payments/overdue-payments.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatsCardComponent,
    AlertsWidgetComponent,
    OccupancyChartComponent,
    PendingTasksComponent,
    RevenueChartComponent,
    ExpenseTrendsChartComponent,
    PaymentHistoryComponent,
    OverduePaymentsComponent,
    CurrencyFormatPipe
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  error: string | null = null;
  
  // Filtros de fecha
  startDate: string = '';
  endDate: string = '';

  constructor(private dashboardService: DashboardService) {
    this.setDefaultDates();
  }

  setDefaultDates(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = lastDay.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getGeneralStats().subscribe({
      next: (response) => {
        this.stats = response.data ?? null;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las estadísticas del dashboard';
        this.loading = false;
        console.error('Error loading dashboard stats:', error);
      }
    });
  }

  onDateFilterChange(): void {
    // Los componentes hijos recibirán las nuevas fechas automáticamente
    // a través del Input binding
  }

  refreshDashboard(): void {
    this.loadDashboardStats();
  }
}
