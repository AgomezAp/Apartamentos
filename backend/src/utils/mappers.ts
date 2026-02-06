/**
 * Data Mappers - Backend
 * Transformadores para normalizar datos entre la base de datos y las respuestas API
 */

import { 
  Building, 
  Unit, 
  Tenant, 
  Contract, 
  Payment, 
  Expense,
  Alert 
} from '../interfaces';

/**
 * Mapper para Buildings - DB a API
 */
export class BuildingMapper {
  static toDTO(dbBuilding: any): Building {
    const dto: any = {
      id: dbBuilding.id || dbBuilding.building_id,
      name: dbBuilding.name,
      address: dbBuilding.address,
      city: dbBuilding.city,
      state: dbBuilding.state,
      postal_code: dbBuilding.postal_code || dbBuilding.zip_code,
      country: dbBuilding.country,
      total_floors: dbBuilding.total_floors || dbBuilding.floors,
      total_units: dbBuilding.total_units,
      max_capacity: dbBuilding.max_capacity,
      description: dbBuilding.description,
      construction_year: dbBuilding.construction_year || dbBuilding.year_built,
      is_active: dbBuilding.is_active !== false,
      created_at: dbBuilding.created_at,
      updated_at: dbBuilding.updated_at,
    };

    // Agregar estadísticas si están disponibles (vienen de getWithStats)
    if (dbBuilding.units_count !== undefined) {
      dto.units_count = parseInt(dbBuilding.units_count) || 0;
    }
    if (dbBuilding.occupied_units !== undefined) {
      const occupied = parseInt(dbBuilding.occupied_units) || 0;
      dto.occupied_units = occupied;
      // vacant_units = total_units - occupied_units
      dto.vacant_units = Math.max(0, (dbBuilding.total_units || 0) - occupied);
    }
    if (dbBuilding.vacant_units !== undefined) {
      dto.vacant_units = parseInt(dbBuilding.vacant_units) || 0;
    }
    if (dbBuilding.occupancy_rate !== undefined) {
      dto.occupancy_rate = parseFloat(dbBuilding.occupancy_rate) || 0;
    }
    if (dbBuilding.active_contracts_count !== undefined) {
      dto.active_contracts_count = parseInt(dbBuilding.active_contracts_count) || 0;
    }

    return dto;
  }

  static toDTOList(dbBuildings: any[]): Building[] {
    return dbBuildings.map(b => this.toDTO(b));
  }

  /**
   * Normaliza datos del frontend para guardar en DB
   * Acepta tanto postal_code como zip_code, floors como total_floors, etc.
   */
  static fromDTO(apiData: any): any {
    const normalized: any = {};

    // Campos directos
    if (apiData.name !== undefined) normalized.name = apiData.name;
    if (apiData.address !== undefined) normalized.address = apiData.address;
    if (apiData.city !== undefined) normalized.city = apiData.city;
    if (apiData.state !== undefined) normalized.state = apiData.state;
    if (apiData.country !== undefined) normalized.country = apiData.country;
    if (apiData.description !== undefined) normalized.description = apiData.description;
    if (apiData.amenities !== undefined) normalized.amenities = apiData.amenities;
    if (apiData.is_active !== undefined) normalized.is_active = apiData.is_active;

    // Código postal - aceptar ambos nombres
    if (apiData.postal_code !== undefined) {
      normalized.postal_code = apiData.postal_code;
    } else if (apiData.zip_code !== undefined) {
      normalized.postal_code = apiData.zip_code;
    }

    // Pisos - aceptar ambos nombres
    if (apiData.total_floors !== undefined && apiData.total_floors !== null && apiData.total_floors !== '') {
      normalized.total_floors = apiData.total_floors;
    } else if (apiData.floors !== undefined && apiData.floors !== null && apiData.floors !== '') {
      normalized.total_floors = apiData.floors;
    }

    // Unidades totales
    if (apiData.total_units !== undefined && apiData.total_units !== null && apiData.total_units !== 0) {
      normalized.total_units = apiData.total_units;
      normalized.max_capacity = apiData.max_capacity || apiData.total_units; // max_capacity por defecto = total_units
    }

    // Año de construcción - aceptar ambos nombres
    if (apiData.construction_year !== undefined && apiData.construction_year !== null && apiData.construction_year !== '') {
      normalized.construction_year = apiData.construction_year;
    } else if (apiData.year_built !== undefined && apiData.year_built !== null && apiData.year_built !== '') {
      normalized.construction_year = apiData.year_built;
    }

    return normalized;
  }
}

/**
 * Mapper para Units - DB a API
 */
export class UnitMapper {
  static toDTO(dbUnit: any): Unit {
    return {
      id: dbUnit.id || dbUnit.unit_id,
      building_id: dbUnit.building_id,
      unit_type_id: dbUnit.unit_type_id,
      unit_number: dbUnit.unit_number,
      floor: dbUnit.floor,
      area_sqm: dbUnit.area_sqm,
      bedrooms: dbUnit.bedrooms,
      bathrooms: dbUnit.bathrooms,
      rental_price: parseFloat(dbUnit.rental_price),
      is_occupied: dbUnit.is_occupied === true,
      occupation_status: dbUnit.occupation_status || (dbUnit.is_occupied ? 'occupied' : 'vacant'),
      description: dbUnit.description,
      features: dbUnit.features,
      is_active: dbUnit.is_active !== false,
      created_at: dbUnit.created_at,
      updated_at: dbUnit.updated_at,
      // Datos relacionales (vienen del query JOIN)
      building_name: dbUnit.building_name,
      type_name: dbUnit.type_name,
      current_tenant: dbUnit.current_tenant,
      tenant_id: dbUnit.tenant_id,
      current_contract_id: dbUnit.current_contract_id,
      contract_end_date: dbUnit.contract_end_date,
    };
  }

  static toDTOList(dbUnits: any[]): Unit[] {
    return dbUnits.map(u => this.toDTO(u));
  }
}

/**
 * Mapper para Tenants - DB a API
 */
export class TenantMapper {
  static toDTO(dbTenant: any): Tenant {
    return {
      id: dbTenant.id || dbTenant.tenant_id,
      // Mapeo de campos de documento para compatibilidad con frontend
      identification_type: dbTenant.document_type,
      identification_number: dbTenant.document_number,
      // También incluir los nombres originales para compatibilidad
      document_type: dbTenant.document_type,
      document_number: dbTenant.document_number,
      first_name: dbTenant.first_name,
      last_name: dbTenant.last_name,
      email: dbTenant.email,
      phone: dbTenant.phone,
      mobile_phone: dbTenant.mobile_phone,
      emergency_contact_name: dbTenant.emergency_contact_name,
      emergency_contact_phone: dbTenant.emergency_contact_phone,
      occupation: dbTenant.occupation,
      company_name: dbTenant.company_name,
      monthly_income: dbTenant.monthly_income ? parseFloat(dbTenant.monthly_income) : undefined,
      notes: dbTenant.notes,
      is_active: dbTenant.is_active !== false,
      created_at: dbTenant.created_at,
      updated_at: dbTenant.updated_at,
      // Campos adicionales de contratos (vienen del JOIN en findAll)
      current_contract_id: dbTenant.current_contract_id,
      contract_status: dbTenant.contract_status,
      unit_id: dbTenant.unit_id,
      unit_number: dbTenant.unit_number,
      building_id: dbTenant.building_id,
      building_name: dbTenant.building_name,
    };
  }

  static toDTOList(dbTenants: any[]): Tenant[] {
    return dbTenants.map(t => this.toDTO(t));
  }
}

/**
 * Mapper para Contracts - DB a API
 */
export class ContractMapper {
  static toDTO(dbContract: any): Contract {
    return {
      id: dbContract.id || dbContract.contract_id,
      unit_id: dbContract.unit_id,
      tenant_id: dbContract.tenant_id,
      contract_number: dbContract.contract_number,
      start_date: dbContract.start_date,
      end_date: dbContract.end_date,
      monthly_rent: parseFloat(dbContract.monthly_rent),
      deposit_amount: dbContract.deposit_amount ? parseFloat(dbContract.deposit_amount) : undefined,
      payment_day: dbContract.payment_day,
      status: dbContract.status,
      notes: dbContract.notes,
      contract_file_path: dbContract.contract_file_path,
      has_rent_increase: dbContract.has_rent_increase === true,
      rent_increase_percentage: dbContract.rent_increase_percentage,
      rent_increase_frequency_months: dbContract.rent_increase_frequency_months,
      next_increase_date: dbContract.next_increase_date,
      created_at: dbContract.created_at,
      updated_at: dbContract.updated_at,
      // Campos relacionados que vienen del JOIN
      tenant_name: dbContract.tenant_name,
      tenant_email: dbContract.tenant_email,
      tenant_phone: dbContract.tenant_phone || dbContract.tenant_mobile_phone,
      unit_number: dbContract.unit_number,
      building_name: dbContract.building_name,
      building_address: dbContract.building_address,
    };
  }

  static toDTOList(dbContracts: any[]): Contract[] {
    return dbContracts.map(c => this.toDTO(c));
  }
}

/**
 * Mapper para Payments - DB a API
 */
export class PaymentMapper {
  static toDTO(dbPayment: any): Payment {
    return {
      id: dbPayment.id || dbPayment.payment_id,
      contract_id: dbPayment.contract_id,
      payment_status_id: dbPayment.payment_status_id,
      period_month: dbPayment.period_month,
      period_year: dbPayment.period_year,
      due_date: dbPayment.due_date,
      payment_date: dbPayment.payment_date,
      amount_due: parseFloat(dbPayment.amount_due || dbPayment.amount || 0),
      amount_paid: parseFloat(dbPayment.amount_paid || 0),
      balance: dbPayment.balance !== undefined 
        ? parseFloat(dbPayment.balance) 
        : parseFloat(dbPayment.amount_due || 0) - parseFloat(dbPayment.amount_paid || 0),
      payment_method: dbPayment.payment_method,
      reference_number: dbPayment.reference_number,
      notes: dbPayment.notes,
      created_at: dbPayment.created_at,
      updated_at: dbPayment.updated_at,
    };
  }

  static toDTOList(dbPayments: any[]): Payment[] {
    return dbPayments.map(p => this.toDTO(p));
  }

  /**
   * Agregar información del status como string
   */
  static toEnhancedDTO(dbPayment: any): any {
    const base = this.toDTO(dbPayment);
    
    // Mapear el status_name a status enum que entienda el frontend
    const statusMap: {[key: string]: string} = {
      'Pendiente': 'pending',
      'Parcial': 'partial',
      'Pagado': 'completed',
      'Vencido': 'overdue',
      'Cancelado': 'cancelled',
      'paid': 'completed',
      'pending': 'pending',
      'overdue': 'overdue',
      'completed': 'completed',
      'cancelled': 'cancelled',
    };
    
    const mappedStatus = statusMap[dbPayment.status_name || dbPayment.status] || 'pending';
    
    // Usar monthly_rent del contrato como el monto real del arriendo
    const monthlyRent = parseFloat(dbPayment.monthly_rent) || 0;
    const amountDue = parseFloat(dbPayment.amount_due || dbPayment.amount || 0);
    const realAmount = monthlyRent > 0 ? monthlyRent : amountDue;
    
    return {
      ...base,
      id: base.id || dbPayment.id,
      payment_id: base.id, // Alias
      amount: realAmount, // Usar monthly_rent como el monto del arriendo
      amount_due: realAmount, // Monto debido = monthly_rent del contrato
      monthly_rent: monthlyRent, // Incluir el monthly_rent del contrato
      status: mappedStatus, // Mapear el status al enum del frontend
      status_name: dbPayment.status_name || this.getStatusFromId(dbPayment.payment_status_id),
      tenant_name: dbPayment.tenant_name || 'Desconocido',
      unit_number: dbPayment.unit_number || 'N/A',
      building_name: dbPayment.building_name || 'Desconocido',
      building_id: dbPayment.building_id,
      unit_id: dbPayment.unit_id,
      tenant_id: dbPayment.tenant_id,
      tenant_email: dbPayment.tenant_email,
      days_overdue: dbPayment.days_overdue,
    };
  }

  static toEnhancedDTOList(dbPayments: any[]): any[] {
    return dbPayments.map(p => this.toEnhancedDTO(p));
  }

  private static getStatusFromId(statusId: number): string {
    // Mapeo correcto según la base de datos:
    // 1 = Pendiente, 2 = Parcial, 3 = Pagado/Completado, 4 = Vencido, 5 = Cancelado
    const statusMap: {[key: number]: string} = {
      1: 'Pendiente',
      2: 'Parcial',
      3: 'Pagado',
      4: 'Vencido',
      5: 'Cancelado',
    };
    return statusMap[statusId] || 'Desconocido';
  }
}

/**
 * Mapper para Expenses - DB a API
 */
export class ExpenseMapper {
  static toDTO(dbExpense: any): Expense {
    return {
      id: dbExpense.id || dbExpense.expense_id,
      expense_category_id: dbExpense.expense_category_id,
      unit_id: dbExpense.unit_id,
      building_id: dbExpense.building_id,
      description: dbExpense.description,
      amount: parseFloat(dbExpense.amount),
      expense_date: dbExpense.expense_date,
      invoice_number: dbExpense.invoice_number,
      vendor: dbExpense.vendor,
      payment_method: dbExpense.payment_method,
      notes: dbExpense.notes,
      receipt_file_path: dbExpense.receipt_file_path,
      created_by: dbExpense.created_by,
      created_at: dbExpense.created_at,
      updated_at: dbExpense.updated_at,
    };
  }

  static toDTOList(dbExpenses: any[]): Expense[] {
    return dbExpenses.map(e => this.toDTO(e));
  }

  static toEnhancedDTO(dbExpense: any): any {
    const base = this.toDTO(dbExpense);
    return {
      ...base,
      expense_id: base.id,
      category_name: dbExpense.category_name,
      unit_number: dbExpense.unit_number,
      building_name: dbExpense.building_name,
    };
  }

  static toEnhancedDTOList(dbExpenses: any[]): any[] {
    return dbExpenses.map(e => this.toEnhancedDTO(e));
  }
}

/**
 * Mapper para Alerts - DB a API
 */
export class AlertMapper {
  static toDTO(dbAlert: any): Alert {
    return {
      id: dbAlert.id || dbAlert.alert_id,
      alert_type_id: dbAlert.alert_type_id,
      title: dbAlert.title,
      message: dbAlert.message,
      priority: dbAlert.priority || 'medium',
      // Mapear is_read/is_resolved a status para compatibilidad
      status: this.mapStatus(dbAlert),
      building_id: dbAlert.building_id,
      unit_id: dbAlert.unit_id,
      contract_id: dbAlert.contract_id,
      payment_id: dbAlert.payment_id,
      tenant_id: dbAlert.tenant_id,
      email_sent: dbAlert.email_sent,
      email_sent_at: dbAlert.email_sent_at,
      metadata: dbAlert.metadata,
      is_active: dbAlert.is_active !== false,
      created_at: dbAlert.created_at,
      updated_at: dbAlert.updated_at,
    };
  }

  static toDTOList(dbAlerts: any[]): Alert[] {
    return dbAlerts.map(a => this.toDTO(a));
  }

  private static mapStatus(dbAlert: any): 'pending' | 'sent' | 'read' | 'dismissed' {
    if (dbAlert.is_resolved) return 'dismissed';
    if (dbAlert.is_read) return 'read';
    if (dbAlert.email_sent) return 'sent';
    return 'pending';
  }
}

/**
 * Normalizar paginación entre diferentes formatos
 */
export class PaginationMapper {
  static normalize(pagination: any): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } {
    const page = pagination.page ?? pagination.currentPage ?? 1;
    const limit = pagination.limit ?? pagination.itemsPerPage ?? 10;
    const total = pagination.total ?? pagination.totalItems ?? 0;
    const totalPages = pagination.totalPages ?? Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}

export default {
  BuildingMapper,
  UnitMapper,
  TenantMapper,
  ContractMapper,
  PaymentMapper,
  ExpenseMapper,
  AlertMapper,
  PaginationMapper,
};
