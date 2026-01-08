/**
 * Script para ejecutar la migración de maintenance_requests
 */
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('185.137.92.54') ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  try {
    console.log('🚀 Iniciando migración de maintenance_requests...');

    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, '../../database/migrations/create_maintenance_requests.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    // Ejecutar el SQL
    await pool.query(sql);

    console.log('✅ Migración completada exitosamente!');
    console.log('✅ Tabla maintenance_requests creada con todos sus índices');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando la migración:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
