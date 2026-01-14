import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { BuildingService } from '../../../buildings/services/building.service';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  DoughnutController
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  BarController,
  LineController,
  DoughnutController,
  Title,
  Tooltip,
  Legend
);

const DEFAULT_CHART_COLORS = {
  success: 'rgba(39, 174, 96, 0.7)',
  danger: 'rgba(231, 76, 60, 0.7)',
  warning: 'rgba(243, 156, 18, 0.7)',
  info: 'rgba(52, 152, 219, 0.7)',
  primary: 'rgba(74, 144, 226, 0.7)'
};

interface IncomePayment {
  paymentId: number;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  status: string;
  building: string;
  unit: string;
  tenant: string;
  tenantEmail: string;
  paymentMethod?: string;
}

interface MonthlyIncome {
  month: number;
  year: number;
  monthLabel: string;
  totalIncome: number;
  completedAmount: number;
  partialAmount: number;
}

@Component({
  selector: 'app-income-report',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyFormatPipe, DateFormatPipe, BaseChartDirective],
  templateUrl: './income-report.component.html',
  styleUrl: './income-report.component.css'
})
export class IncomeReportComponent implements OnInit {
  loading = false;
  payments: IncomePayment[] = [];
  paginatedPayments: IncomePayment[] = [];
  monthlyData: MonthlyIncome[] = [];
  balanceData: any = null;
  balanceTrendData: any[] = [];
  
  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  
  // Configuraciones de gráficos
  trendChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  distributionChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  balanceChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  incomeVsExpensesChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  
  // Opciones de gráficos
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: true, position: 'top' }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => '$' + Number(value).toLocaleString()
        }
      }
    }
  };
  
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: true, position: 'top' }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => '$' + Number(value).toLocaleString()
        }
      }
    }
  };
  
  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: true, position: 'top' }
    }
  };
  
  // Filtros por fecha
  startDate: string = '';
  endDate: string = '';
  selectedBuildingId?: number | null = undefined;
  buildings: any[] = [];
  
  // Array de meses para labels
  months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  // Totales
  totalIncome = 0;
  totalCompleted = 0;
  totalPartial = 0;
  completedCount = 0;
  partialCount = 0;

  constructor(private reportService: ReportService, private buildingService: BuildingService) {
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
    this.loadBuildings();
    this.loadIncomeReport();
    this.loadMonthlyTrend();
    this.loadBalance();
    this.loadBalanceTrendByPeriod();
  }

  loadBuildings(): void {
    this.reportService; // noop to satisfy linter if unused
    // Cargar edificios activos para el filtro
    const bs = (this as any).buildingService as BuildingService;
    if (bs && bs.getActiveBuildings) {
      bs.getActiveBuildings().subscribe({
        next: (response: any) => {
          this.buildings = (response && response.data) ? response.data : [];
        },
        error: (err) => console.error('Error cargando edificios:', err)
      });
    }
  }

  loadIncomeReport(): void {
    if (!this.startDate || !this.endDate) {
      return;
    }
    
    this.loading = true;
    
    this.reportService.getIncomeByPeriod(
      this.startDate,
      this.endDate,
      this.selectedBuildingId || undefined
    ).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.payments = response.data.payments || [];
          this.updatePagination();
          
          // Actualizar totales desde el resumen del backend
          if (response.data.summary) {
            this.totalIncome = response.data.summary.totalIncome || 0;
            this.totalCompleted = response.data.summary.totalCompleted || 0;
            this.totalPartial = response.data.summary.totalPartial || 0;
            this.completedCount = response.data.summary.completedCount || 0;
            this.partialCount = response.data.summary.partialCount || 0;
          }
          
          // Generar gráfico de distribución
          this.distributionChartData = {
            labels: ['Pagos Completados', 'Pagos Parciales'],
            datasets: [{
              data: [this.totalCompleted, this.totalPartial],
              backgroundColor: [
                DEFAULT_CHART_COLORS.success,
                DEFAULT_CHART_COLORS.warning
              ]
            }]
          };
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading income report:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadIncomeReport();
    this.loadMonthlyTrend();
    this.loadBalance();
    this.loadBalanceTrendByPeriod();
  }

  loadMonthlyTrend(): void {
    // Cargar últimos 6 meses de datos usando el nuevo endpoint
    this.reportService.getIncomeTrend(6).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.monthlyData = response.data.map((item: any) => ({
            month: item.month,
            year: item.year,
            monthLabel: this.months[item.month - 1].label,
            totalIncome: item.totalIncome,
            completedAmount: item.completedIncome,
            partialAmount: item.partialIncome
          })).reverse(); // Invertir para que aparezcan en orden cronológico
          
          this.generateCharts();
        }
      },
      error: (error) => {
        console.error('Error loading income trend:', error);
      }
    });
  }

  loadBalance(): void {
    if (!this.startDate || !this.endDate) {
      return;
    }
    
    this.reportService.getIncomeVsExpenses(this.startDate, this.endDate, this.selectedBuildingId || undefined).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.balanceData = response.data;
          this.generateBalanceChart();
        }
      },
      error: (error) => {
        console.error('Error loading balance:', error);
      }
    });
  }

  loadBalanceTrend(): void {
    this.reportService.getBalanceTrend(6).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.balanceTrendData = response.data.reverse();
          this.generateIncomeVsExpensesChart();
        }
      },
      error: (error) => {
        console.error('Error loading balance trend:', error);
      }
    });
  }

  loadBalanceTrendByPeriod(): void {
    if (!this.startDate || !this.endDate) {
      return;
    }

    this.reportService.getBalanceTrendByPeriod(this.startDate, this.endDate, this.selectedBuildingId || undefined).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.balanceTrendData = response.data;
          this.generateIncomeVsExpensesChart();
        }
      },
      error: (error) => {
        console.error('Error loading balance trend by period:', error);
      }
    });
  }

  generateCharts(): void {
    // Gráfico de tendencia de ingresos
    this.trendChartData = {
      labels: this.monthlyData.map(d => `${d.monthLabel} ${d.year}`),
      datasets: [
        {
          label: 'Pagos Completados',
          data: this.monthlyData.map(d => d.completedAmount),
          backgroundColor: DEFAULT_CHART_COLORS.success
        },
        {
          label: 'Pagos Parciales',
          data: this.monthlyData.map(d => d.partialAmount),
          backgroundColor: DEFAULT_CHART_COLORS.warning
        }
      ]
    };

    // Gráfico de distribución de pagos
    this.distributionChartData = {
      labels: ['Pagos Completados', 'Pagos Parciales'],
      datasets: [{
        data: [this.totalCompleted, this.totalPartial],
        backgroundColor: [
          DEFAULT_CHART_COLORS.success,
          DEFAULT_CHART_COLORS.warning
        ]
      }]
    };
  }

  generateBalanceChart(): void {
    if (!this.balanceData) return;

    this.balanceChartData = {
      labels: ['Ingresos', 'Gastos Regulares', 'Mantenimiento'],
      datasets: [{
        data: [
          this.balanceData.income.total,
          this.balanceData.expenses.regular,
          this.balanceData.expenses.maintenance
        ],
        backgroundColor: [
          DEFAULT_CHART_COLORS.success,
          DEFAULT_CHART_COLORS.danger,
          DEFAULT_CHART_COLORS.warning
        ]
      }]
    };
  }

  generateIncomeVsExpensesChart(): void {
    if (this.balanceTrendData.length === 0) return;

    this.incomeVsExpensesChartData = {
      labels: this.balanceTrendData.map(d => {
        const monthLabel = this.months[d.month - 1]?.label || '';
        return `${monthLabel} ${d.year}`;
      }),
      datasets: [
        {
          label: 'Ingresos',
          data: this.balanceTrendData.map(d => d.income),
          backgroundColor: DEFAULT_CHART_COLORS.success
        },
        {
          label: 'Egresos (Gastos + Mantenimiento)',
          data: this.balanceTrendData.map(d => d.expenses),
          backgroundColor: DEFAULT_CHART_COLORS.danger
        }
      ]
    };
  }

  exportToExcel(): void {
    // Preparar datos para exportar
    const data = this.payments.map(p => ({
      'Fecha Vencimiento': p.dueDate,
      'Edificio': p.building,
      'Unidad': p.unit,
      'Inquilino': p.tenant,
      'Estado': p.status,
      'Monto Debido': p.amountDue,
      'Monto Pagado': p.amountPaid
    }));

    this.reportService.exportToExcel(
      data,
      `Reporte_Ingresos_${this.startDate}_${this.endDate}.xlsx`
    );
  }

  exportToPDF(): void {
    const content = {
      title: 'Reporte de Ingresos',
      period: `${this.startDate} - ${this.endDate}`,
      summary: {
        'Total Ingresos': this.totalIncome,
        'Pagos Completados': this.totalCompleted,
        'Pagos Parciales': this.totalPartial
      },
      payments: this.payments
    };

    this.reportService.exportToPDF(
      content,
      `Reporte_Ingresos_${this.startDate}_${this.endDate}.pdf`
    );
  }

  // Métodos de paginación
  updatePagination(): void {
    this.totalPages = Math.ceil(this.payments.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updatePaginatedPayments();
  }

  updatePaginatedPayments(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPayments = this.payments.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedPayments();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Métodos para totales de la tabla de tendencia
  getTotalIncome(): number {
    return this.balanceTrendData.reduce((sum, item) => sum + item.income, 0);
  }

  getTotalExpenses(): number {
    return this.balanceTrendData.reduce((sum, item) => sum + item.expenses, 0);
  }

  getTotalRegularExpenses(): number {
    return this.balanceTrendData.reduce((sum, item) => sum + (item.expenses - (item.maintenanceExpenses || 0)), 0);
  }

  getTotalMaintenance(): number {
    return this.balanceTrendData.reduce((sum, item) => sum + (item.maintenanceExpenses || 0), 0);
  }

  getTotalBalance(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  getAverageMargin(): number {
    const totalIncome = this.getTotalIncome();
    if (totalIncome === 0) return 0;
    const margin = ((this.getTotalBalance() / totalIncome) * 100);
    return Math.round(margin * 100) / 100;
  }
}
