import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {

  transform(value: number | string | null | undefined, currencySymbol: string = '$', decimals: number = 2): string {
    if (value === null || value === undefined || value === '') {
      return `${currencySymbol}0.00`;
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return `${currencySymbol}0.00`;
    }

    const formatted = numValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${currencySymbol}${formatted}`;
  }

}
