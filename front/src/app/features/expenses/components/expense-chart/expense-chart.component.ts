import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthSummary } from '../../models/expense.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-expense-chart',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './expense-chart.component.html',
  styleUrl: './expense-chart.component.css'
})
export class ExpenseChartComponent implements OnChanges {
  @Input() monthlyData: MonthSummary[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;

  maxAmount = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['monthlyData'] && this.monthlyData.length > 0) {
      this.calculateMaxAmount();
    }
  }

  calculateMaxAmount(): void {
    this.maxAmount = Math.max(...this.monthlyData.map(d => d.total));
  }

  getBarHeight(amount: number): number {
    if (this.maxAmount === 0) return 0;
    return (amount / this.maxAmount) * 100;
  }

  getMonthLabel(month: number): string {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months[month - 1] || '';
  }

  getTotalAmount(): number {
    return this.monthlyData.reduce((sum, data) => sum + data.total, 0);
  }

  getAverageAmount(): number {
    if (this.monthlyData.length === 0) return 0;
    return this.getTotalAmount() / this.monthlyData.length;
  }
}
