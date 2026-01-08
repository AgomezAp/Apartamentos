import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contract } from '../../models/contract.model';

interface TimelineEvent {
  date: Date;
  title: string;
  description: string;
  type: 'start' | 'end' | 'renewal' | 'increase';
  isPast: boolean;
  isCurrent: boolean;
}

@Component({
  selector: 'app-contract-timeline',
  imports: [CommonModule],
  templateUrl: './contract-timeline.component.html',
  styleUrl: './contract-timeline.component.css'
})
export class ContractTimelineComponent {
  @Input() contract!: Contract;

  get timelineEvents(): TimelineEvent[] {
    if (!this.contract) return [];

    const events: TimelineEvent[] = [];
    const today = new Date();

    // Evento de inicio
    const startDate = new Date(this.contract.start_date);
    events.push({
      date: startDate,
      title: 'Inicio de contrato',
      description: `Contrato iniciado el ${this.formatDate(startDate)}`,
      type: 'start',
      isPast: startDate < today,
      isCurrent: false
    });

    // Eventos de incremento de renta
    if (this.contract.has_rent_increase && this.contract.rent_increase_frequency_months) {
      let increaseDate = new Date(startDate);
      const endDate = new Date(this.contract.end_date);
      
      while (increaseDate < endDate) {
        increaseDate = new Date(increaseDate);
        increaseDate.setMonth(increaseDate.getMonth() + this.contract.rent_increase_frequency_months);
        
        if (increaseDate < endDate) {
          events.push({
            date: increaseDate,
            title: `Incremento de renta (${this.contract.rent_increase_percentage}%)`,
            description: `Incremento programado`,
            type: 'increase',
            isPast: increaseDate < today,
            isCurrent: this.isCurrentMonth(increaseDate)
          });
        }
      }
    }

    // Evento de fin
    const endDate = new Date(this.contract.end_date);
    events.push({
      date: endDate,
      title: 'Fin de contrato',
      description: `Contrato finaliza el ${this.formatDate(endDate)}`,
      type: 'end',
      isPast: endDate < today,
      isCurrent: false
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private isCurrentMonth(date: Date): boolean {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  getEventIcon(type: string): string {
    switch (type) {
      case 'start': return '🏠';
      case 'end': return '🏁';
      case 'increase': return '📈';
      case 'renewal': return '🔄';
      default: return '📅';
    }
  }

  formatEventDate(date: Date): string {
    return date.toLocaleDateString('es-ES');
  }
}
