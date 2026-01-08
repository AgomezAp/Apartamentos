import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

/**
 * Inicializa la base de datos ejecutando el schema SQL si las tablas no existen
 */
export async function initDatabase(pool: Pool): Promise<void> {
  try {
    // Verificar si las tablas ya existen
    const checkQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'buildings'
      );
    `;
    
    const result = await pool.query(checkQuery);
    const tablesExist = result.rows[0].exists;

    if (tablesExist) {
      console.log('✅ Las tablas ya existen en la base de datos');
      return;
    }

    console.log('🔄 Las tablas no existen. Creando schema...');

    // Leer el archivo SQL
    const schemaPath = path.join(__dirname, '../../database/schema_postgres.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.warn('⚠️  Archivo schema_postgres.sql no encontrado');
      return;
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    // Ejecutar el schema SQL
    await pool.query(schemaSql);

    console.log('✅ Schema de base de datos creado exitosamente');
    console.log('📊 Tablas creadas: 24 tablas, 3 vistas, triggers y datos iniciales');

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
}
