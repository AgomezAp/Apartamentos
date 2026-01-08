const { executeQuery } = require('./dist/config/database');

executeQuery("SELECT column_name FROM information_schema.columns WHERE table_name='expenses' ORDER BY ordinal_position")
  .then(r => {
    console.log("Columnas en tabla 'expenses':");
    r.forEach(row => console.log(`  - ${row.column_name}`));
  })
  .catch(e => console.error("Error:", e.message));
