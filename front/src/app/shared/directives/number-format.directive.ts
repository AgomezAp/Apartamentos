import { Directive, HostListener, ElementRef } from '@angular/core';

/**
 * Directivo para formatear números con separadores de miles
 * Uso: appNumberFormat en inputs de tipo text
 * Ejemplo: <input type="text" appNumberFormat>
 */
@Directive({
  selector: '[appNumberFormat]',
  standalone: true
})
export class NumberFormatDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement as HTMLInputElement;
    let value = input.value.replace(/\./g, ''); // Eliminar puntos previos
    
    // Eliminar cualquier carácter que no sea número
    value = value.replace(/\D/g, '');
    
    // Formatear con separadores de miles
    if (value) {
      input.value = this.formatNumber(value);
    }
  }

  @HostListener('blur')
  onBlur(): void {
    const input = this.el.nativeElement as HTMLInputElement;
    if (input.value) {
      const numericValue = input.value.replace(/\./g, '');
      input.value = this.formatNumber(numericValue);
    }
  }

  private formatNumber(value: string): string {
    if (!value) return '';
    // Formatear con separadores de miles: 1000 -> 1.000, 1000000 -> 1.000.000
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}
