import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from './service/catalog.service';

/**
 * CatalogsModule
 * 
 * Módulo de catálogos que proporciona servicios para:
 * - Tipos de unidades (unit-types)
 * - Tipos de servicios (service-types)
 * - Estados de pagos (payment-statuses)
 * - Tipos de alertas (alert-types)
 * - Usuarios (users)
 * - Categorías de gastos (expense-categories)
 * 
 * Este módulo NO tiene componentes propios, solo servicios.
 * Los catálogos se usan en otros módulos (settings, etc.)
 */
@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    CatalogService
  ]
})
export class CatalogsModule { }