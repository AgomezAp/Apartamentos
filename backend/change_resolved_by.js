require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function changeResolvedByType() {
  try {
    console.log('=== Cambiando resolved_by de INT a VARCHAR ===\n');
    
    // 1. Eliminar foreign key constraint si existe
    console.log('1. Eliminando foreign key constraint...');
    try {
      await pool.query(`
        ALTER TABLE maintenance_requests 
        DROP CONSTRAINT IF EXISTS maintenance_requests_resolved_by_fkey
      `);
      console.log('   ✅ Constraint eliminado (o no existía)');
    } catch (err) {
      console.log('   ⚠️ No se pudo eliminar constraint:', err.message);
    }
    
    // 2. Cambiar tipo de columna
    console.log('2. Cambiando tipo de columna a VARCHAR(255)...');
    try {
      await pool.query(`
        ALTER TABLE maintenance_requests 
        ALTER COLUMN resolved_by TYPE VARCHAR(255) USING resolved_by::VARCHAR(255)
      `);
      console.log('   ✅ Tipo cambiado exitosamente');
    } catch (err) {
      if (err.message.includes('already type')) {
        console.log('   ⚠️ Ya es tipo VARCHAR');
      } else {
        console.error('   ❌ Error:', err.message);
      }
    }
    
    // 3. Verificar resultado
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'maintenance_requests' 
        AND column_name = 'resolved_by'
    `);
    console.log('\n=== Verificación ===');
    console.table(result.rows);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

changeResolvedByType();
