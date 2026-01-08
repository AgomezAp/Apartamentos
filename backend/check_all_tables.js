const { executeQuery } = require('./dist/config/database');

async function checkTables() {
  const tables = ['expenses', 'maintenance_requests', 'payments', 'contracts', 'units', 'expense_categories'];
  
  for (const table of tables) {
    console.log(`\n========== ${table.toUpperCase()} ==========`);
    const result = await executeQuery(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_name='${table}' 
       ORDER BY ordinal_position`
    );
    result.forEach(row => {
      console.log(`  ${row.column_name.padEnd(30)} ${row.data_type}`);
    });
  }
  
  process.exit(0);
}

checkTables().catch(e => {
  console.error("Error:", e.message);
  process.exit(1);
});
