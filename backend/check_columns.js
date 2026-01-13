require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
  try {
    console.log('Conectando a:', process.env.DATABASE_URL.split('@')[1]);
    
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'maintenance_requests' 
      ORDER BY column_name
    `);
    
    console.log('\nColumnas en maintenance_requests:');
    result.rows.forEach(row => console.log(' -', row.column_name));
    
    // Verificar si existen las columnas del técnico
    const techColumns = ['assigned_to_name', 'assigned_to_phone', 'assigned_to_company', 'assigned_to_email'];
    const existingColumns = result.rows.map(r => r.column_name);
    
    console.log('\n=== Verificación de columnas del técnico ===');
    techColumns.forEach(col => {
      const exists = existingColumns.includes(col);
      console.log(`${exists ? '✅' : '❌'} ${col}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

checkColumns();
