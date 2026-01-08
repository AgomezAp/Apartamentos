import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-export-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './export-buttons.component.html',
  styleUrl: './export-buttons.component.css'
})
export class ExportButtonsComponent {
  @Input() data: any[] = [];
  @Input() filename: string = 'reporte';
  @Input() disabled: boolean = false;
  @Output() export = new EventEmitter<{format: string, data: any[]}>();

  constructor(private reportService: ReportService) {}

  onExport(format: 'excel' | 'pdf' | 'csv'): void {
    if (this.disabled || !this.data || this.data.length === 0) {
      return;
    }

    // Emit event for parent component to handle
    this.export.emit({ format, data: this.data });

    // Also use service method
    const finalFilename = `${this.filename}_${this.getCurrentDate()}`;
    
    switch (format) {
      case 'excel':
        this.reportService.exportToExcel(this.data, finalFilename);
        break;
      case 'pdf':
        this.reportService.exportToPDF(this.data, finalFilename);
        break;
      case 'csv':
        this.reportService.exportToCSV(this.data, finalFilename);
        break;
    }
  }

  getCurrentDate(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
}
