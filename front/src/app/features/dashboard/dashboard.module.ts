import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardService } from './services/dashboard.service';

// Pages
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';

// Components
import { StatsCardComponent } from './components/stats-card/stats-card.component';
import { AlertsWidgetComponent } from './components/alerts-widget/alerts-widget.component';
import { OccupancyChartComponent } from './components/occupancy-chart/occupancy-chart.component';
import { PendingTasksComponent } from './components/pending-tasks/pending-tasks.component';
import { RecentPaymentsComponent } from './components/recent-payments/recent-payments.component';
import { RevenueChartComponent } from './components/revenue-chart/revenue-chart.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DashboardRoutingModule,
    // Standalone components
    DashboardHomeComponent,
    StatsCardComponent,
    AlertsWidgetComponent,
    OccupancyChartComponent,
    PendingTasksComponent,
    RecentPaymentsComponent,
    RevenueChartComponent
  ],
  providers: [
    DashboardService
  ]
})
export class DashboardModule { }