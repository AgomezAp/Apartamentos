require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false }
});

async function addResetTokenColumns() {
  try {
    console.log('Conectando a la base de datos...');

    const columns = [
      { name: 'reset_token', type: 'VARCHAR(255)' },
      { name: 'reset_token_expires', type: 'TIMESTAMP' }
    ];

    for (const col of columns) {
      try {
        console.log(`\nAgregando columna: ${col.name}...`);
        await pool.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Columna ${col.name} agregada`);
      } catch (err) {
        if (err.code === '42701') {
          console.log(`⚠️  Columna ${col.name} ya existe`);
        } else {
          console.error(`❌ Error agregando ${col.name}:`, err.message);
        }
      }
    }

    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name IN ('reset_token', 'reset_token_expires')
      ORDER BY column_name
    `);

    console.log('\n=== Columnas de recuperación de contraseña ===');
    if (result.rows.length === 0) {
      console.log('  ❌ Las columnas no fueron creadas');
    } else {
      result.rows.forEach(row => console.log(` ✅ ${row.column_name} (${row.data_type})`));
    }

    await pool.end();
    console.log('\n✅ Migración completada');
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

addResetTokenColumns();
