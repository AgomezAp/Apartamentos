import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {

  transform(value: string | null | undefined, limit: number = 50, completeWords: boolean = false, ellipsis: string = '...'): string {
    if (!value) return '';

    if (value.length <= limit) {
      return value;
    }

    if (completeWords) {
      // Truncar en el último espacio antes del límite
      const truncated = value.substr(0, limit);
      const lastSpace = truncated.lastIndexOf(' ');
      return lastSpace > 0 ? truncated.substr(0, lastSpace) + ellipsis : truncated + ellipsis;
    }

    return value.substr(0, limit) + ellipsis;
  }

}
