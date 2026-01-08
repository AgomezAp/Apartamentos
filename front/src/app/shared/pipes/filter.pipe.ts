import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true,
  pure: false
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], searchText: string, properties?: string[]): any[] {
    if (!items || !searchText) {
      return items;
    }

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      // Si se especifican propiedades, buscar solo en esas propiedades
      if (properties && properties.length > 0) {
        return properties.some(prop => {
          const value = this.getNestedProperty(item, prop);
          return value && value.toString().toLowerCase().includes(searchText);
        });
      }

      // Si no se especifican propiedades, buscar en todas las propiedades del objeto
      return Object.keys(item).some(key => {
        const value = item[key];
        return value && value.toString().toLowerCase().includes(searchText);
      });
    });
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  }

}
