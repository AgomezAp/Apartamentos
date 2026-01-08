export interface MaintenanceRequest {
  request_id: number;
  unit_id: number;
  tenant_id: number;
  category: 'Plomería' | 'Electricidad' | 'Pintura' | 'Carpintería' | 'Cerrajería' | 'Electrodomésticos' | 'Limpieza' | 'Aire Acondicionado' | 'Otros';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  title: string;
  description: string;
  reported_date: string;
  scheduled_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  assigned_to?: number;
  assigned_to_name?: string;
  assigned_to_phone?: string;
  assigned_to_company?: string;
  assigned_to_email?: string;
  assigned_to_display_name?: string;  // Para mostrar (combinación de usuario o tercero)
  resolved_by?: number;
  resolved_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  unit_number?: string;
  building_name?: string;
  tenant_name?: string;
  resolved_by_name?: string;
}

export interface MaintenanceFormData {
  building_id: number;
  unit_id: number;
  tenant_id?: number;  // Opcional, para unidades desocupadas
  category: string;
  priority: string;
  title: string;
  description: string;
  scheduled_date?: string;
  estimated_cost?: number;
  assigned_to?: number;
}

export interface MaintenanceFilter {
  status?: string;
  priority?: string;
  unit_id?: number;
  tenant_id?: number;
  category?: string;
}

export interface MaintenanceStats {
  category: string;
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  average_cost: number;
}

export interface MaintenanceUpdate {
  status?: string;
  priority?: string;
  scheduled_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  assigned_to?: number | string;
  assigned_to_name?: string;
  assigned_to_phone?: string;
  assigned_to_company?: string;
  assigned_to_email?: string;
  notes?: string;
}

export interface MaintenanceResolve {
  resolved_by: number | string;
  actual_cost?: number;
  notes?: string;
}

export interface MaintenanceTimelineEvent {
  date: string;
  event: string;
  description: string;
  user?: string;
  type: 'created' | 'assigned' | 'updated' | 'scheduled' | 'resolved' | 'cancelled';
}

export const MaintenanceCategories = [
  { value: 'Plomería', label: 'Plomería', icon: '🚧' },
  { value: 'Electricidad', label: 'Electricidad', icon: '⚡' },
  { value: 'Electrodomésticos', label: 'Electrodomésticos', icon: '🔧' },
  { value: 'Pintura', label: 'Pintura', icon: '🎨' },
  { value: 'Carpintería', label: 'Carpintería', icon: '🪚' },
  { value: 'Cerrajería', label: 'Cerrajería', icon: '🔑' },
  { value: 'Limpieza', label: 'Limpieza', icon: '🧹' },
  { value: 'Aire Acondicionado', label: 'Aire Acondicionado', icon: '❄️' },
  { value: 'Otros', label: 'Otros', icon: '🔧' }
];

export const MaintenancePriorities = [
  { value: 'low', label: 'Baja', color: '#95a5a6' },
  { value: 'medium', label: 'Media', color: '#4a90e2' },
  { value: 'high', label: 'Alta', color: '#f39c12' },
  { value: 'urgent', label: 'Urgente', color: '#e74c3c' }
];

export const MaintenanceStatuses = [
  { value: 'pending', label: 'Pendiente', color: '#f39c12' },
  { value: 'in_progress', label: 'En Progreso', color: '#4a90e2' },
  { value: 'completed', label: 'Completado', color: '#27ae60' },
  { value: 'cancelled', label: 'Cancelado', color: '#e74c3c' }
];