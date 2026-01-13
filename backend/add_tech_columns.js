require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addColumns() {
  try {
    console.log('Conectando a:', process.env.DATABASE_URL.split('@')[1]);
    
    // Agregar cada columna por separado
    const columns = [
      { name: 'assigned_to_name', type: 'VARCHAR(255)' },
      { name: 'assigned_to_phone', type: 'VARCHAR(20)' },
      { name: 'assigned_to_company', type: 'VARCHAR(255)' },
      { name: 'assigned_to_email', type: 'VARCHAR(255)' }
    ];
    
    for (const col of columns) {
      try {
        console.log(`\nAgregando columna: ${col.name}...`);
        await pool.query(`ALTER TABLE maintenance_requests ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Columna ${col.name} agregada`);
      } catch (err) {
        if (err.code === '42701') {
          console.log(`⚠️ Columna ${col.name} ya existe`);
        } else {
          console.error(`❌ Error agregando ${col.name}:`, err.message);
        }
      }
    }
    
    // Verificar resultado
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'maintenance_requests' 
        AND column_name LIKE 'assigned_to%'
      ORDER BY column_name
    `);
    
    console.log('\n=== Columnas assigned_to* después de migración ===');
    result.rows.forEach(row => console.log(' ✅', row.column_name));
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

addColumns();
