import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string | Date | null | undefined, format: string = 'dd/MM/yyyy'): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) {
      return '';
    }

    const day = this.padZero(date.getDate());
    const month = this.padZero(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    const seconds = this.padZero(date.getSeconds());

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const monthNamesShort = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    let formatted = format;
    formatted = formatted.replace('dd', day);
    formatted = formatted.replace('MM', month);
    formatted = formatted.replace('yyyy', year.toString());
    formatted = formatted.replace('yy', year.toString().substr(2));
    formatted = formatted.replace('HH', hours);
    formatted = formatted.replace('mm', minutes);
    formatted = formatted.replace('ss', seconds);
    formatted = formatted.replace('MMMM', monthNames[date.getMonth()]);
    formatted = formatted.replace('MMM', monthNamesShort[date.getMonth()]);

    return formatted;
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

}
