import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, LineController, BarElement, BarController, Title, Tooltip, Legend, ChartConfiguration } from 'chart.js';
import { ReportService } from '../../../reports/services/report.service';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, BarElement, BarController, Title, Tooltip, Legend);

interface TrendData {
  month: number | string;
  income: number;
  expenses: number;
}

@Component({
  selector: 'app-expense-trends-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './expense-trends-chart.component.html',
  styleUrl: './expense-trends-chart.component.css'
})
export class ExpenseTrendsChartComponent implements OnInit, OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';

  trendData: TrendData[] = [];
  chartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          padding: 15,
          usePointStyle: true
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Monto ($)',
          font: { size: 12 }
        },
        ticks: {
          callback: (value) => {
            if (typeof value === 'number') {
              return '$' + value.toLocaleString('es-CO', { maximumFractionDigits: 0 });
            }
            return value;
          }
        }
      }
    }
  };

  loading = false;
  error = '';

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadTrendData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['startDate'] || changes['endDate']) && !changes['startDate']?.firstChange) {
      this.loadTrendData();
    }
  }

  loadTrendData(): void {
    if (!this.startDate || !this.endDate) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.reportService.getBalanceTrendByPeriod(this.startDate, this.endDate).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.trendData = response.data;
          this.generateChart();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar datos de tendencias';
        this.loading = false;
        console.error(err);
      }
    });
  }

  generateChart(): void {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const labels = this.trendData.map(d => {
      // month puede ser número (2) o string ("2026-02")
      if (typeof d.month === 'number') {
        return monthNames[d.month - 1] || `Mes ${d.month}`;
      }
      const monthStr = String(d.month);
      if (monthStr.includes('-')) {
        const parts = monthStr.split('-');
        const monthIndex = parseInt(parts[1]) - 1;
        return monthNames[monthIndex] || monthStr;
      }
      const idx = parseInt(monthStr) - 1;
      return monthNames[idx] || monthStr;
    });
    const incomeData = this.trendData.map(d => d.income);
    const expenseData = this.trendData.map(d => d.expenses);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: incomeData,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: '#10B981',
          borderWidth: 2,
          borderRadius: 4,
          barPercentage: 0.4,
          categoryPercentage: 0.8,
        },
        {
          label: 'Gastos',
          data: expenseData,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: '#EF4444',
          borderWidth: 2,
          borderRadius: 4,
          barPercentage: 0.4,
          categoryPercentage: 0.8,
        }
      ]
    };
  }
}
