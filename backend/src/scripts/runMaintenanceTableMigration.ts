import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    console.log('🚀 Ejecutando migración para tabla maintenance_requests...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../../database/migrations/create_maintenance_requests.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Ejecutar el SQL
    await pool.query(sql);
    
    console.log('✅ Tabla maintenance_requests creada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar migración:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
