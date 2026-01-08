/**
 * Building Model
 * Modelo para la gestión de edificios
 */

export interface Building {
  id?: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code?: string;
  zip_code?: string;
  country?: string;
  total_units?: number;
  construction_year?: number;
  year_built?: number;
  total_floors?: number;
  floors?: number;
  max_capacity?: number;
  description?: string;
  amenities?: string;
  photo_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // Campos de estadísticas (solo vienen de getWithStats)
  units_count?: number;           // Unidades realmente registradas en el sistema
  occupied_units?: number;         // Unidades ocupadas
  vacant_units?: number;           // Unidades vacantes
  active_contracts_count?: number; // Contratos activos
  occupancy_rate?: number;
}

export interface BuildingStats {
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_rate: number;
  total_revenue?: number;
  pending_payments?: number;
  active_contracts?: number;
  maintenance_requests?: number;
}

export interface BuildingFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  total_units: number;
  year_built?: number;
  floors?: number;
  description?: string;
  amenities?: string;
  is_active?: boolean;
}

export interface BuildingFilter {
  search?: string;
  city?: string;
  state?: string;
  is_active?: boolean;
  min_units?: number;
  max_units?: number;
}

export interface BuildingDashboard {
  building: Building;
  stats: BuildingStats;
  recent_payments?: any[];
  recent_maintenance?: any[];
}