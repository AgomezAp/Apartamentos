import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {

  transform(value: number | string | null | undefined, currencySymbol: string = '$', decimals: number = 0): string {
    if (value === null || value === undefined || value === '') {
      return `${currencySymbol}0`;
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return `${currencySymbol}0`;
    }

    // Formato colombiano: puntos como separadores de miles
    const parts = numValue.toFixed(decimals).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    if (decimals > 0 && parts[1]) {
      return `${currencySymbol}${integerPart},${parts[1]}`;
    }
    return `${currencySymbol}${integerPart}`;
  }

}
