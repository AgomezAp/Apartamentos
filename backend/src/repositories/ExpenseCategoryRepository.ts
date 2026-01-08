import { executeQuery } from '../config/database';

class ExpenseCategoryRepository {
  /**
   * Obtener todas las categorías de gastos activas
   */
  async findAll(): Promise<any[]> {
    return executeQuery(
      'SELECT * FROM expense_categories WHERE is_active = TRUE ORDER BY name ASC',
      []
    );
  }

  /**
   * Obtener una categoría por ID
   */
  async findById(id: number): Promise<any> {
    const result = await executeQuery(
      'SELECT * FROM expense_categories WHERE id = $1',
      [id]
    ) as any[];
    return result[0];
  }

  /**
   * Crear una nueva categoría
   */
  async create(categoryData: {
    name: string;
    description?: string;
  }): Promise<any> {
    const result = await executeQuery(
      `INSERT INTO expense_categories (name, description, created_at, updated_at) 
       VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [categoryData.name, categoryData.description || null]
    ) as any[];
    return result[0];
  }

  /**
   * Actualizar una categoría
   */
  async update(id: number, categoryData: Partial<{
    name: string;
    description: string;
    is_active: boolean;
  }>): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(categoryData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE expense_categories 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await executeQuery(query, values) as any[];
    return result[0];
  }

  /**
   * Verificar si existe una categoría
   */
  async exists(id: number): Promise<boolean> {
    const result = await executeQuery(
      'SELECT COUNT(*) as count FROM expense_categories WHERE id = $1',
      [id]
    ) as any[];
    return parseInt(result[0]?.count || 0) > 0;
  }

  /**
   * Poblar categorías por defecto
   */
  async seedDefaultCategories(): Promise<void> {
    const defaultCategories = [
      { name: 'Mantenimiento', description: 'Mantenimiento preventivo y correctivo de instalaciones' },
      { name: 'Servicios Públicos', description: 'Agua, luz, gas, internet de áreas comunes' },
      { name: 'Reparaciones', description: 'Reparaciones de emergencia y averías' },
      { name: 'Seguros', description: 'Pólizas de seguro del edificio' },
      { name: 'Impuestos', description: 'Impuestos prediales y otros gravámenes' },
      { name: 'Limpieza', description: 'Servicios de aseo y limpieza' },
      { name: 'Vigilancia', description: 'Servicios de seguridad y vigilancia' },
      { name: 'Jardinería', description: 'Mantenimiento de zonas verdes' },
      { name: 'Administración', description: 'Gastos administrativos del edificio' },
      { name: 'Otros', description: 'Otros gastos no clasificados' },
    ];

    for (const category of defaultCategories) {
      try {
        // Verificar si ya existe
        const existing = await executeQuery(
          'SELECT id FROM expense_categories WHERE name = $1',
          [category.name]
        ) as any[];

        if (existing.length === 0) {
          await this.create(category);
        }
      } catch (error) {
        console.error(`Error creando categoría ${category.name}:`, error);
      }
    }
  }
}

export default new ExpenseCategoryRepository();
