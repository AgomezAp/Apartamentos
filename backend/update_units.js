const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'apartamentos_db',
  user: 'postgres',
  password: 'desarrollo123'
});

async function updateUnits() {
  try {
    const result = await pool.query(`
      UPDATE units u 
      SET occupation_status = 'occupied',
          tenant_id = (
            SELECT c.tenant_id 
            FROM contracts c 
            WHERE c.unit_id = u.id 
            AND c.status = 'active' 
            ORDER BY c.created_at DESC 
            LIMIT 1
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE u.id IN (
        SELECT DISTINCT c.unit_id 
        FROM contracts c 
        WHERE c.status = 'active'
      )
      AND u.occupation_status != 'occupied'
    `);
    
    console.log(`✅ ${result.rowCount} unidades actualizadas a estado 'occupied'`);
    
    // Mostrar las unidades actualizadas
    const units = await pool.query(`
      SELECT u.id, u.unit_number, u.occupation_status, u.tenant_id, b.name as building_name
      FROM units u
      JOIN buildings b ON u.building_id = b.id
      WHERE u.occupation_status = 'occupied'
      ORDER BY b.name, u.unit_number
    `);
    
    console.log('\n📋 Unidades ocupadas:');
    units.rows.forEach(u => {
      console.log(`   ${u.building_name} - Unidad ${u.unit_number}: ${u.occupation_status} (Tenant: ${u.tenant_id})`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

updateUnits();
