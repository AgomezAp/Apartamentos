const {executeQuery} = require('./dist/config/database');

async function checkTable() {
  try {
    const columns = await executeQuery(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'alerts' ORDER BY ordinal_position"
    );
    console.log('\n=== Columnas de la tabla alerts ===');
    console.table(columns);
    
    const count = await executeQuery("SELECT COUNT(*) as total FROM alerts");
    console.log('\nTotal de registros:', count[0].total);
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkTable();
