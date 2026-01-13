const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Usar la misma conexión que el backend
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('=== Running Migration: Add Technician Info ===\n');
    
    const migrationPath = path.join(__dirname, 'database', 'migrations', 'add_technician_info.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('SQL to execute:\n', sql);
    
    await pool.query(sql);
    
    console.log('\n✅ Migration completed successfully!');
    
    // Verify columns exist
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'maintenance_requests' 
        AND column_name LIKE 'assigned_to%'
      ORDER BY column_name
    `);
    
    console.log('\n=== Columns in maintenance_requests table ===');
    console.table(result.rows);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error running migration:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
