import { executeQuery, executeUpdate } from '../config/database';
import { Unit, PaginationParams } from '../interfaces';

interface UnitFilters {
  building_id?: number;
  status?: string;
  unit_type_id?: number;
  search?: string;
  min_rent?: number;
  max_rent?: number;
  bedrooms?: number;
  furnished?: boolean;
}

class UnitRepository {
  /**
   * Obtener unidades con paginación y múltiples filtros
   */
  async findAll(filters: UnitFilters = {}, pagination: PaginationParams): Promise<Unit[]> {
    const offset = ((pagination.page || 1) - 1) * (pagination.limit || 10);
    const params: any[] = [];
    let paramIndex = 1;
    
    let query = `
      SELECT u.*, 
             b.name as building_name,
             ut.name as type_name,
             CONCAT(t.first_name, ' ', t.last_name) as current_tenant,
             t.id as tenant_id,
             c.id as current_contract_id,
             c.end_date as contract_end_date
      FROM units u
      INNER JOIN buildings b ON u.building_id = b.id
      LEFT JOIN unit_types ut ON u.unit_type_id = ut.id
      LEFT JOIN contracts c ON u.id = c.unit_id AND c.status = 'active'
      LEFT JOIN tenants t ON c.tenant_id = t.id
      WHERE u.is_active = TRUE
    `;

    // Aplicar filtros
    if (filters.building_id) {
      query += ` AND u.building_id = $${paramIndex++}`;
      params.push(filters.building_id);
    }

    if (filters.status) {
      query += ` AND u.occupation_status = $${paramIndex++}`;
      params.push(filters.status);
    }

    if (filters.unit_type_id) {
      query += ` AND u.unit_type_id = $${paramIndex++}`;
      params.push(filters.unit_type_id);
    }

    if (filters.search) {
      query += ` AND (
        LOWER(u.unit_number) LIKE LOWER($${paramIndex}) OR
        LOWER(b.name) LIKE LOWER($${paramIndex + 1}) OR
        LOWER(CONCAT(t.first_name, ' ', t.last_name)) LIKE LOWER($${paramIndex + 2})
      )`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      paramIndex += 3;
    }

    if (filters.min_rent !== undefined) {
      query += ` AND u.monthly_rent >= $${paramIndex++}`;
      params.push(filters.min_rent);
    }

    if (filters.max_rent !== undefined) {
      query += ` AND u.monthly_rent <= $${paramIndex++}`;
      params.push(filters.max_rent);
    }

    if (filters.bedrooms !== undefined) {
      query += ` AND u.bedrooms = $${paramIndex++}`;
      params.push(filters.bedrooms);
    }

    if (filters.furnished !== undefined) {
      query += ` AND u.furnished = $${paramIndex++}`;
      params.push(filters.furnished);
    }

    query += ` ORDER BY b.name, u.unit_number LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(pagination.limit || 10, offset);

    return await executeQuery(query, params);
  }

  /**
   * Contar unidades con filtros
   */
  async count(filters: UnitFilters = {}): Promise<number> {
    const params: any[] = [];
    let paramIndex = 1;
    
    let query = 'SELECT COUNT(*) as count FROM units u WHERE u.is_active = TRUE';

    if (filters.building_id) {
      query += ` AND u.building_id = $${paramIndex++}`;
      params.push(filters.building_id);
    }

    if (filters.status) {
      query += ` AND u.occupation_status = $${paramIndex++}`;
      params.push(filters.status);
    }

    if (filters.unit_type_id) {
      query += ` AND u.unit_type_id = $${paramIndex++}`;
      params.push(filters.unit_type_id);
    }

    if (filters.search) {
      query += ` AND (
        LOWER(u.unit_number) LIKE LOWER($${paramIndex}) OR
        LOWER((SELECT name FROM buildings WHERE id = u.building_id)) LIKE LOWER($${paramIndex + 1}) OR
        LOWER(CONCAT((SELECT first_name FROM tenants t2 
                      JOIN contracts c2 ON c2.tenant_id = t2.id 
                      WHERE c2.unit_id = u.id AND c2.status = 'active' LIMIT 1), ' ',
                     (SELECT last_name FROM tenants t3 
                      JOIN contracts c3 ON c3.tenant_id = t3.id 
                      WHERE c3.unit_id = u.id AND c3.status = 'active' LIMIT 1))) LIKE LOWER($${paramIndex + 2})
      )`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      paramIndex += 3;
    }

    if (filters.min_rent !== undefined) {
      query += ` AND u.monthly_rent >= $${paramIndex++}`;
      params.push(filters.min_rent);
    }

    if (filters.max_rent !== undefined) {
      query += ` AND u.monthly_rent <= $${paramIndex++}`;
      params.push(filters.max_rent);
    }

    if (filters.bedrooms !== undefined) {
      query += ` AND u.bedrooms = $${paramIndex++}`;
      params.push(filters.bedrooms);
    }

    if (filters.furnished !== undefined) {
      query += ` AND u.furnished = $${paramIndex++}`;
      params.push(filters.furnished);
    }

    const result: any = await executeQuery(query, params);
    return parseInt(result[0].count);
  }

  /**
   * Obtener unidad por ID
   */
  async findById(id: number): Promise<Unit | null> {
    const query = `
      SELECT u.*, 
             b.name as building_name,
             ut.name as type_name,
             CONCAT(t.first_name, ' ', t.last_name) as current_tenant,
             t.id as tenant_id,
             c.id as current_contract_id,
             c.end_date as contract_end_date
      FROM units u
      INNER JOIN buildings b ON u.building_id = b.id
      LEFT JOIN unit_types ut ON u.unit_type_id = ut.id
      LEFT JOIN contracts c ON u.id = c.unit_id AND c.status = 'active'
      LEFT JOIN tenants t ON c.tenant_id = t.id
      WHERE u.id = $1 AND u.is_active = TRUE
    `;
    const results: any[] = await executeQuery(query, [id]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Crear una nueva unidad
   */
  async create(unit: Unit): Promise<number> {
    const query = `
      INSERT INTO units (
        building_id, unit_type_id, unit_number, floor,
        area_sqm, bedrooms, bathrooms, rental_price,
        occupation_status, features, description, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const result: any = await executeQuery(query, [
      unit.building_id,
      unit.unit_type_id || null,
      unit.unit_number,
      unit.floor || null,
      unit.area_sqm || null,
      unit.bedrooms || null,
      unit.bathrooms || null,
      unit.rental_price || null,
      unit.occupation_status || 'vacant',
      JSON.stringify(unit.features || {}),
      unit.description || null,
    ]);
    return result[0].id;
  }

  /**
   * Actualizar una unidad
   */
  async update(id: number, unit: Partial<Unit>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (unit.unit_number !== undefined) {
      fields.push(`unit_number = $${paramIndex}`);
      values.push(unit.unit_number);
      paramIndex++;
    }
    if (unit.floor !== undefined) {
      fields.push(`floor = $${paramIndex}`);
      values.push(unit.floor);
      paramIndex++;
    }
    if (unit.rental_price !== undefined) {
      fields.push(`rental_price = $${paramIndex}`);
      values.push(unit.rental_price);
      paramIndex++;
    }
    if (unit.occupation_status !== undefined) {
      fields.push(`occupation_status = $${paramIndex}`);
      values.push(unit.occupation_status);
      paramIndex++;
    }
    if (unit.features !== undefined) {
      fields.push(`features = $${paramIndex}`);
      values.push(JSON.stringify(unit.features));
      paramIndex++;
    }
    if (unit.description !== undefined) {
      fields.push(`description = $${paramIndex}`);
      values.push(unit.description);
      paramIndex++;
    }

    if (fields.length === 0) return false;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE units SET ${fields.join(', ')} WHERE id = $${paramIndex} AND is_active = TRUE`;
    const rowCount = await executeUpdate(query, values);
    return rowCount > 0;
  }

  /**
   * Actualizar el estado de ocupación de una unidad
   */
  async updateOccupationStatus(unitId: number, status: string): Promise<boolean> {
    console.log('🔧 updateOccupationStatus llamado:', { unitId, status });
    
    const query = `UPDATE units SET occupation_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`;
    
    console.log('📝 Query SQL:', query);
    console.log('📝 Valores:', [status, unitId]);
    
    const rowCount = await executeUpdate(query, [status, unitId]);
    console.log('✅ Filas actualizadas:', rowCount);
    
    return rowCount > 0;
  }

  /**
   * Eliminar (soft delete) una unidad
   */
  /**
   * Eliminar unidad y todos sus contratos, pagos y mantenimientos en cascada
   */
  async delete(id: number): Promise<boolean> {
    try {
      // 1. Eliminar pagos de contratos de esta unidad
      await executeUpdate(
        `DELETE FROM payments WHERE contract_id IN (
          SELECT id FROM contracts WHERE unit_id = $1
        )`,
        [id]
      );

      // 2. Eliminar contratos de esta unidad
      await executeUpdate(
        'DELETE FROM contracts WHERE unit_id = $1',
        [id]
      );

      // 3. Eliminar solicitudes de mantenimiento de esta unidad
      await executeUpdate(
        'DELETE FROM maintenance_requests WHERE unit_id = $1',
        [id]
      );

      // 4. Finalmente eliminar la unidad
      const rowCount = await executeUpdate(
        'DELETE FROM units WHERE id = $1',
        [id]
      );
      
      return rowCount > 0;
    } catch (error) {
      console.error('Error en borrado en cascada de unidad:', error);
      throw error;
    }
  }

  /**
   * Obtener unidades desocupadas
   */
  async findVacant(buildingId?: number): Promise<Unit[]> {
    let query = `
      SELECT u.*, 
             b.name as building_name,
             ut.name as type_name
      FROM units u
      INNER JOIN buildings b ON u.building_id = b.id
      LEFT JOIN unit_types ut ON u.unit_type_id = ut.id
      WHERE u.occupation_status = 'vacant' AND u.is_active = TRUE
    `;
    const params: any[] = [];

    if (buildingId) {
      query += ' AND u.building_id = $1';
      params.push(buildingId);
    }

    query += ' ORDER BY b.name, u.unit_number';

    return await executeQuery(query, params);
  }

  /**
   * Obtener reporte de unidades desocupadas con días
   */
  async getVacantReport(): Promise<any[]> {
    const query = `
      SELECT u.id, u.unit_number, u.rental_price,
             b.id as building_id, b.name as building_name,
             COALESCE(
               (SELECT MAX(c.end_date) 
                FROM contracts c
                WHERE c.unit_id = u.id),
               u.created_at::date
             ) as last_occupied_date,
             COALESCE(
               CURRENT_DATE - (SELECT MAX(c.end_date) 
                              FROM contracts c
                              WHERE c.unit_id = u.id),
               CURRENT_DATE - u.created_at::date
             ) as days_vacant
      FROM units u
      INNER JOIN buildings b ON u.building_id = b.id
      WHERE u.occupation_status = 'vacant' AND u.is_active = TRUE AND b.is_active = TRUE
      ORDER BY days_vacant DESC
    `;
    return await executeQuery(query);
  }

  /**
   * Búsqueda avanzada de unidades con filtros
   */
  async advancedSearch(filters: {
    search?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    building_id?: number;
    bedrooms?: number;
    bathrooms?: number;
    minArea?: number;
    maxArea?: number;
  }, pagination: PaginationParams): Promise<Unit[]> {
    const offset = ((pagination.page || 1) - 1) * (pagination.limit || 10);
    let query = `
      SELECT u.*, 
             b.name as building_name,
             b.city as building_city,
             ut.name as type_name
      FROM units u
      INNER JOIN buildings b ON u.building_id = b.id
      LEFT JOIN unit_types ut ON u.unit_type_id = ut.id
      WHERE u.is_active = TRUE
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Búsqueda por texto (unit_number o descripción)
    if (filters.search) {
      query += ` AND (
        u.unit_number ILIKE $${paramIndex} OR 
        u.description ILIKE $${paramIndex} OR
        b.name ILIKE $${paramIndex}
      )`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    // Filtro por ciudad
    if (filters.city) {
      query += ` AND b.city ILIKE $${paramIndex}`;
      params.push(`%${filters.city}%`);
      paramIndex++;
    }

    // Filtro por rango de precio
    if (filters.minPrice !== undefined) {
      query += ` AND u.rental_price >= $${paramIndex}`;
      params.push(filters.minPrice);
      paramIndex++;
    }
    if (filters.maxPrice !== undefined) {
      query += ` AND u.rental_price <= $${paramIndex}`;
      params.push(filters.maxPrice);
      paramIndex++;
    }

    // Filtro por estado de ocupación
    if (filters.status) {
      query += ` AND u.occupation_status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    // Filtro por edificio
    if (filters.building_id) {
      query += ` AND u.building_id = $${paramIndex}`;
      params.push(filters.building_id);
      paramIndex++;
    }

    // Filtro por habitaciones
    if (filters.bedrooms) {
      query += ` AND u.bedrooms = $${paramIndex}`;
      params.push(filters.bedrooms);
      paramIndex++;
    }

    // Filtro por baños
    if (filters.bathrooms) {
      query += ` AND u.bathrooms = $${paramIndex}`;
      params.push(filters.bathrooms);
      paramIndex++;
    }

    // Filtro por área
    if (filters.minArea) {
      query += ` AND u.area_sqm >= $${paramIndex}`;
      params.push(filters.minArea);
      paramIndex++;
    }
    if (filters.maxArea) {
      query += ` AND u.area_sqm <= $${paramIndex}`;
      params.push(filters.maxArea);
      paramIndex++;
    }

    query += ` ORDER BY b.name, u.unit_number LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pagination.limit || 10, offset);

    return await executeQuery(query, params);
  }

  /**
   * Contar resultados de búsqueda avanzada
   */
  async countAdvancedSearch(filters: {
    search?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    building_id?: number;
    bedrooms?: number;
    bathrooms?: number;
    minArea?: number;
    maxArea?: number;
  }): Promise<number> {
    let query = `
      SELECT COUNT(*) as count
      FROM units u
      INNER JOIN buildings b ON u.building_id = b.id
      WHERE u.is_active = TRUE
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.search) {
      query += ` AND (
        u.unit_number ILIKE $${paramIndex} OR 
        u.description ILIKE $${paramIndex} OR
        b.name ILIKE $${paramIndex}
      )`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.city) {
      query += ` AND b.city ILIKE $${paramIndex}`;
      params.push(`%${filters.city}%`);
      paramIndex++;
    }

    if (filters.minPrice !== undefined) {
      query += ` AND u.rental_price >= $${paramIndex}`;
      params.push(filters.minPrice);
      paramIndex++;
    }
    if (filters.maxPrice !== undefined) {
      query += ` AND u.rental_price <= $${paramIndex}`;
      params.push(filters.maxPrice);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND u.occupation_status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.building_id) {
      query += ` AND u.building_id = $${paramIndex}`;
      params.push(filters.building_id);
      paramIndex++;
    }

    if (filters.bedrooms) {
      query += ` AND u.bedrooms = $${paramIndex}`;
      params.push(filters.bedrooms);
      paramIndex++;
    }

    if (filters.bathrooms) {
      query += ` AND u.bathrooms = $${paramIndex}`;
      params.push(filters.bathrooms);
      paramIndex++;
    }

    if (filters.minArea) {
      query += ` AND u.area_sqm >= $${paramIndex}`;
      params.push(filters.minArea);
      paramIndex++;
    }
    if (filters.maxArea) {
      query += ` AND u.area_sqm <= $${paramIndex}`;
      params.push(filters.maxArea);
      paramIndex++;
    }

    const result: any = await executeQuery(query, params);
    return parseInt(result[0].count);
  }
}

export default new UnitRepository();
