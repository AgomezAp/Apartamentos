const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'apartamentos_db',
  user: 'postgres',
  password: 'Lucho.2068'
});

async function runMigration() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    const sql = `
      ALTER TABLE maintenance_requests
      ADD COLUMN IF NOT EXISTS assigned_to_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS assigned_to_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS assigned_to_company VARCHAR(255),
      ADD COLUMN IF NOT EXISTS assigned_to_email VARCHAR(255);
    `;

    await client.query(sql);
    console.log('✅ Migración ejecutada exitosamente');
    console.log('✅ Columnas agregadas:');
    console.log('   - assigned_to_name');
    console.log('   - assigned_to_phone');
    console.log('   - assigned_to_company');
    console.log('   - assigned_to_email');

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
  } finally {
    await client.end();
    console.log('✅ Conexión cerrada');
  }
}

runMigration();
