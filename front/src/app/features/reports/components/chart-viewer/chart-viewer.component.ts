import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData, DEFAULT_CHART_COLORS } from '../../models';

@Component({
  selector: 'app-chart-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-viewer.component.html',
  styleUrl: './chart-viewer.component.css'
})
export class ChartViewerComponent implements OnChanges {
  @Input() chartData!: ChartData;
  @Input() title: string = '';
  @Input() height: number = 300;

  chartColors = DEFAULT_CHART_COLORS;
  maxValue: number = 0;
  Math = Math;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] && this.chartData) {
      this.calculateMaxValue();
    }
  }

  calculateMaxValue(): void {
    const allValues: number[] = [];
    this.chartData.datasets.forEach((dataset: any) => {
      allValues.push(...dataset.data);
    });
    this.maxValue = Math.max(...allValues, 0);
  }

  getBarHeight(value: number): number {
    if (this.maxValue === 0) return 0;
    return (value / this.maxValue) * 100;
  }

  getColor(index: number, datasetIndex: number = 0): string {
    const dataset = this.chartData.datasets[datasetIndex];
    
    if (Array.isArray(dataset.backgroundColor)) {
      return dataset.backgroundColor[index] || '#667eea';
    }
    
    if (dataset.backgroundColor) {
      return dataset.backgroundColor;
    }
    
    return ['#667eea', '#27ae60', '#f39c12', '#e74c3c', '#3498db'][datasetIndex % 5];
  }

  getBorderColor(index: number, datasetIndex: number = 0): string {
    const dataset = this.chartData.datasets[datasetIndex];
    
    if (Array.isArray(dataset.borderColor)) {
      return dataset.borderColor[index] || '#667eea';
    }
    
    if (dataset.borderColor) {
      return dataset.borderColor;
    }
    
    return this.getColor(index, datasetIndex);
  }

  getTotalValue(): number {
    return this.chartData.datasets[0]?.data.reduce((sum: any, val: any) => sum + val, 0) || 0;
  }

  getPercentage(value: number): number {
    const total = this.getTotalValue();
    return total > 0 ? (value / total) * 100 : 0;
  }

  getArcLength(value: number): number {
    const percentage = this.getPercentage(value);
    return (percentage / 100) * (2 * Math.PI * 80);
  }

  getArcOffset(index: number): number {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this.getArcLength(this.chartData.datasets[0].data[i]);
    }
    return -offset;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-ES').format(value);
  }
}
