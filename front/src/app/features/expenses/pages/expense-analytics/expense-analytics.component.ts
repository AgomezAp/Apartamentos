import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { CatalogService } from '../../../catalogs/service/catalog.service';
import { ExpenseStatistics } from '../../models/expense.model';
import { Building } from '../../../buildings/models/building.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController
} from 'chart.js';

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-expense-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CurrencyFormatPipe, BaseChartDirective],
  templateUrl: './expense-analytics.component.html',
  styleUrl: './expense-analytics.component.css'
})
export class ExpenseAnalyticsComponent implements OnInit {
  statistics: ExpenseStatistics | null = null;
  buildings: Building[] = [];
  
  selectedBuildingId: number | undefined = undefined;
  startDate = '';
  endDate = '';
  
  loading = true;
  error: string | null = null;

  // Chart configurations
  
  barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };
  
  lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => {
            return '$' + Number(value).toLocaleString();
          }
        }
      }
    }
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => {
            return '$' + Number(value).toLocaleString();
          }
        }
      }
    }
  };

  constructor(
    private expenseService: ExpenseService,
    private catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    this.loadBuildings();
    this.loadStatistics();
  }

  loadBuildings(): void {
    this.catalogService.getBuildings().subscribe({
      next: (response:any) => {
        this.buildings = response.data;
      },
      error: (error) => {
        console.error('Error loading buildings:', error);
      }
    });
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = null;

    const filter: any = {};
    if (this.selectedBuildingId) filter.building_id = this.selectedBuildingId;
    if (this.startDate) filter.start_date = this.startDate;
    if (this.endDate) filter.end_date = this.endDate;

    this.expenseService.getStatistics(filter).subscribe({
      next: (response:any) => {
        this.statistics = response.data;
        this.loadCharts();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las estadísticas';
        this.loading = false;
        console.error('Error loading statistics:', error);
      }
    });
  }

  loadCharts(): void {
    if (!this.statistics) {
      console.warn('No statistics available');
      return;
    }

    // Validar que haya datos de tendencia mensual
    if (!this.statistics.monthly_trend || this.statistics.monthly_trend.length === 0) {
      console.warn('No monthly trend data available');
      // Inicializar gráficos vacíos
      this.barChartData = { labels: [], datasets: [] };
      this.lineChartData = { labels: [], datasets: [] };
      return;
    }

    // Preparar datos para gráficos
    const months = this.statistics.monthly_trend.map(m => m.month_name || `${m.month}/${m.year}`);
    const amounts = this.statistics.monthly_trend.map(m => m.total);

    // Validar que haya datos
    if (months.length === 0 || amounts.length === 0) {
      console.warn('Invalid chart data');
      this.barChartData = { labels: [], datasets: [] };
      this.lineChartData = { labels: [], datasets: [] };
      return;
    }

    // Configurar gráfico de barras
    this.barChartData = {
      labels: months,
      datasets: [
        {
          label: 'Gastos por Mes',
          data: amounts,
          backgroundColor: 'rgba(74, 144, 226, 0.7)',
          borderColor: 'rgba(74, 144, 226, 1)',
          borderWidth: 1
        }
      ]
    };

    // Configurar gráfico de línea
    this.lineChartData = {
      labels: months,
      datasets: [
        {
          label: 'Tendencia de Gastos',
          data: amounts,
          borderColor: 'rgba(74, 144, 226, 1)',
          backgroundColor: 'rgba(74, 144, 226, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }
      ]
    };

    console.log('Charts loaded successfully', {
      barChartData: this.barChartData,
      lineChartData: this.lineChartData
    });
  }

  onFilterChange(): void {
    this.loadStatistics();
  }

  clearFilters(): void {
    this.selectedBuildingId = undefined;
    this.startDate = '';
    this.endDate = '';
    this.loadStatistics();
  }

  getCategoryColor(index: number): string {
    const colors = [
      '#4a90e2',
      '#27ae60',
      '#f39c12',
      '#e74c3c',
      '#9b59b6',
      '#1abc9c',
      '#e67e22',
      '#34495e'
    ];
    return colors[index % colors.length];
  }

  getPaymentMethodLabel(method: string): string {
    const methods: { [key: string]: string } = {
      'cash': 'Efectivo',
      'transfer': 'Transferencia',
      'check': 'Cheque',
      'card': 'Tarjeta',
      'other': 'Otro'
    };
    return methods[method] || method;
  }
}
