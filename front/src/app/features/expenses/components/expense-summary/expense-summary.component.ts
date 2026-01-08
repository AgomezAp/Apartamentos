import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseSummary, CategorySummary } from '../../models/expense.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-expense-summary',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './expense-summary.component.html',
  styleUrl: './expense-summary.component.css'
})
export class ExpenseSummaryComponent {
  @Input() summary?: ExpenseSummary;
  @Input() loading = false;
  @Input() error: string | null = null;

  getPercentageWidth(category: CategorySummary): number {
    if (!this.summary || this.summary.total_amount === 0) return 0;
    return (category.total_amount / this.summary.total_amount) * 100;
  }

  getCategoryColor(index: number): string {
    const colors = [
      '#4a90e2', // blue
      '#27ae60', // green
      '#f39c12', // orange
      '#e74c3c', // red
      '#9b59b6', // purple
      '#1abc9c', // turquoise
      '#e67e22', // carrot
      '#34495e'  // dark gray
    ];
    return colors[index % colors.length];
  }

  getAverageExpense(): number {
    if (!this.summary || this.summary.total_expenses === 0) return 0;
    return this.summary.total_amount / this.summary.total_expenses;
  }
}
