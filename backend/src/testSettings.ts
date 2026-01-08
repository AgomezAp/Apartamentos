import { executeQuery } from './config/database';

async function testSettings() {
  try {
    console.log('🔍 Verificando configuraciones en la base de datos...\n');

    const result: any = await executeQuery(
      'SELECT key, value, data_type, category FROM settings ORDER BY category, key LIMIT 10'
    );

    console.log(`✅ Total configuraciones encontradas: ${result.rows.length}\n`);

    result.rows.forEach((row: any) => {
      console.log(`📌 ${row.category.padEnd(15)} | ${row.key.padEnd(30)} | ${row.value}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testSettings();
