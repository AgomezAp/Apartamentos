export interface Unit {
  id?: number;
  unit_id?: number; // Alias para compatibilidad
  building_id: number;
  unit_number: string;
  floor?: number;
  unit_type_id?: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  area?: number; // Alias del backend
  status?: 'available' | 'occupied' | 'maintenance' | 'reserved';
  occupation_status?: 'vacant' | 'occupied' | 'reserved' | 'maintenance'; // Del backend
  is_occupied?: boolean; // Del backend
  monthly_rent?: number;
  rental_price?: number; // Alias del backend
  deposit_required?: number;
  furnished?: boolean;
  description?: string;
  amenities?: string[];
  photo_url?: string;
  is_active?: boolean; // Del backend
  created_at?: Date;
  updated_at?: Date;
  
  // Relaciones
  building_name?: string;
  type_name?: string; // Nombre del tipo de unidad
  unit_type_name?: string; // Alias
  current_tenant?: string; // Nombre del inquilino actual
  tenant_id?: number; // ID del inquilino actual
  current_contract_id?: number;
  contract_end_date?: Date; // Fecha de vencimiento del contrato
}

export interface UnitFormData {
  building_id: number;
  unit_number: string;
  floor?: number;
  unit_type_id?: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  monthly_rent?: number;
  deposit_required?: number;
  furnished: boolean;
  description?: string;
  amenities?: string[];
}

export interface UnitStats {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  reserved: number;
  occupancyRate: number;
  averageRent: number;
}

export interface UnitFilter {
  building_id?: number;
  status?: string;
  unit_type_id?: number;
  min_rent?: number;
  max_rent?: number;
  bedrooms?: number;
  furnished?: boolean;
  search?: string;
}
