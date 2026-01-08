import { executeQuery, executeUpdate } from '../config/database';
import { Building, PaginationParams } from '../interfaces';

interface FilterParams extends PaginationParams {
  search?: string;
}

class BuildingRepository {
  /**
   * Obtener todos los edificios con paginación y búsqueda
   */
  async findAll(params: FilterParams): Promise<Building[]> {
    const offset = ((params.page || 1) - 1) * (params.limit || 10);
    
    // Construir condiciones de filtro
    let whereCondition = 'b.is_active = TRUE';
    const queryParams: any[] = [];
    
    if (params.search) {
      whereCondition += ` AND (
        LOWER(b.name) LIKE LOWER($${queryParams.length + 1}) OR
        LOWER(b.city) LIKE LOWER($${queryParams.length + 2}) OR
        LOWER(b.state) LIKE LOWER($${queryParams.length + 3}) OR
        LOWER(b.address) LIKE LOWER($${queryParams.length + 4})
      )`;
      const searchTerm = `%${params.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const query = `
      SELECT b.id,
             b.name,
             b.address,
             b.city,
             b.state,
             b.postal_code,
             b.country,
             b.total_floors,
             b.max_capacity,
             b.total_units,
             b.description,
             b.construction_year,
             b.is_active,
             b.created_at,
             b.updated_at,
             COUNT(DISTINCT u.id) as units_count,
             COUNT(DISTINCT CASE WHEN u.occupation_status = 'occupied' THEN u.id END) as occupied_units,
             COUNT(DISTINCT CASE WHEN u.occupation_status = 'vacant' THEN u.id END) as vacant_units,
             ROUND(
               CASE 
                 WHEN COUNT(DISTINCT u.id) > 0 THEN 
                   (COUNT(DISTINCT CASE WHEN u.occupation_status = 'occupied' THEN u.id END)::NUMERIC / COUNT(DISTINCT u.id)::NUMERIC) * 100
                 ELSE 0
               END, 2
             ) as occupancy_rate,
             COUNT(DISTINCT c.id) as active_contracts_count
      FROM buildings b
      LEFT JOIN units u ON b.id = u.building_id AND u.is_active = TRUE
      LEFT JOIN contracts c ON u.id = c.unit_id AND c.status = 'active' AND c.end_date >= CURRENT_DATE
      WHERE ${whereCondition}
      GROUP BY b.id,
               b.name,
               b.address,
               b.city,
               b.state,
               b.postal_code,
               b.country,
               b.total_floors,
               b.max_capacity,
               b.total_units,
               b.description,
               b.construction_year,
               b.is_active,
               b.created_at,
               b.updated_at
      ORDER BY b.name
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    
    queryParams.push(params.limit || 10, offset);
    return await executeQuery(query, queryParams);
  }

  /**
   * Contar total de edificios con filtro
   */
  async count(search?: string): Promise<number> {
    let query = 'SELECT COUNT(DISTINCT b.id) as count FROM buildings b WHERE b.is_active = TRUE';
    const params: any[] = [];
    
    if (search) {
      query += ` AND (
        LOWER(b.name) LIKE LOWER($1) OR
        LOWER(b.city) LIKE LOWER($2) OR
        LOWER(b.state) LIKE LOWER($3) OR
        LOWER(b.address) LIKE LOWER($4)
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const result: any = await executeQuery(query, params);
    return parseInt(result[0].count);
  }

  /**
   * Obtener edificio por ID con estadísticas
   */
  async getWithStats(id: number): Promise<Building | null> {
    const query = `
      SELECT b.*,
             COUNT(DISTINCT u.id) as units_count,
             COUNT(DISTINCT CASE WHEN u.occupation_status = 'occupied' THEN u.id END) as occupied_units,
             COUNT(DISTINCT c.id) as active_contracts_count
      FROM buildings b
      LEFT JOIN units u ON b.id = u.building_id AND u.is_active = TRUE
      LEFT JOIN contracts c ON u.id = c.unit_id AND c.status = 'active' AND c.end_date >= CURRENT_DATE
      WHERE b.id = $1 AND b.is_active = TRUE
      GROUP BY b.id
    `;
    const results: any[] = await executeQuery(query, [id]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Obtener edificio por ID
   */
  async findById(id: number): Promise<Building | null> {
    const results: any[] = await executeQuery(
      'SELECT * FROM buildings WHERE id = $1 AND is_active = TRUE',
      [id]
    );
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Crear un nuevo edificio
   */
  async create(building: Building): Promise<number> {
    const query = `
      INSERT INTO buildings (
        name, address, city, state, postal_code, country,
        construction_year, total_floors, max_capacity, total_units, description, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const result: any = await executeQuery(query, [
      building.name,
      building.address || null,
      building.city || null,
      building.state || null,
      building.postal_code || null,
      (building as any).country || 'México',
      building.construction_year || null,
      building.total_floors || null,
      building.max_capacity || null,
      building.total_units || null,
      building.description || null,
    ]);
    return result[0].id;
  }

  /**
   * Actualizar un edificio
   */
  async update(id: number, building: Partial<Building>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (building.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(building.name);
      paramIndex++;
    }
    if (building.address !== undefined) {
      fields.push(`address = $${paramIndex}`);
      values.push(building.address);
      paramIndex++;
    }
    if (building.city !== undefined) {
      fields.push(`city = $${paramIndex}`);
      values.push(building.city);
      paramIndex++;
    }
    if (building.state !== undefined) {
      fields.push(`state = $${paramIndex}`);
      values.push(building.state);
      paramIndex++;
    }
    if (building.postal_code !== undefined) {
      fields.push(`postal_code = $${paramIndex}`);
      values.push(building.postal_code);
      paramIndex++;
    }
    if ((building as any).country !== undefined) {
      fields.push(`country = $${paramIndex}`);
      values.push((building as any).country);
      paramIndex++;
    }
    if (building.construction_year !== undefined) {
      fields.push(`construction_year = $${paramIndex}`);
      values.push(building.construction_year);
      paramIndex++;
    }
    if (building.total_floors !== undefined) {
      fields.push(`total_floors = $${paramIndex}`);
      values.push(building.total_floors);
      paramIndex++;
    }
    if (building.total_units !== undefined) {
      fields.push(`total_units = $${paramIndex}`);
      values.push(building.total_units);
      paramIndex++;
    }
    if (building.max_capacity !== undefined) {
      fields.push(`max_capacity = $${paramIndex}`);
      values.push(building.max_capacity);
      paramIndex++;
    }
    if (building.description !== undefined) {
      fields.push(`description = $${paramIndex}`);
      values.push(building.description);
      paramIndex++;
    }

    if (fields.length === 0) return false;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE buildings SET ${fields.join(', ')} WHERE id = $${paramIndex} AND is_active = TRUE`;
    const rowCount = await executeUpdate(query, values);
    return rowCount > 0;
  }

  /**
   * Eliminar (soft delete) un edificio
   */
  async delete(id: number): Promise<boolean> {
    const rowCount = await executeUpdate(
      'UPDATE buildings SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND is_active = TRUE',
      [id]
    );
    return rowCount > 0;
  }
}

export default new BuildingRepository();
