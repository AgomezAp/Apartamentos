/**
 * Script para arreglar los IDs de payment_statuses
 * Asegura que los IDs sean consistentes con lo que espera el código:
 * 1 = Pendiente
 * 2 = Pagado
 * 3 = Vencido
 * 4 = Parcial
 */

const { Pool } = require('pg');
require('dotenv').config();

// Usar DATABASE_URL si está disponible, sino usar variables individuales
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'apartamentos'}`
});

async function fixPaymentStatuses() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Arreglando payment_statuses...\n');
    
    // Verificar estado actual
    const current = await client.query('SELECT * FROM payment_statuses ORDER BY id');
    console.log('Estado actual:');
    current.rows.forEach(row => console.log(`  ID ${row.id}: ${row.name}`));
    console.log('');
    
    // Los IDs correctos según el código
    const correctStatuses = [
      { id: 1, name: 'Pendiente', color_code: '#ffc107', description: 'Pago pendiente' },
      { id: 2, name: 'Pagado', color_code: '#28a745', description: 'Pago completado' },
      { id: 3, name: 'Vencido', color_code: '#dc3545', description: 'Pago vencido' },
      { id: 4, name: 'Parcial', color_code: '#17a2b8', description: 'Pago parcial realizado' }
    ];
    
    await client.query('BEGIN');
    
    // Desactivar temporalmente la restricción de foreign key
    await client.query('SET CONSTRAINTS ALL DEFERRED');
    
    // Verificar si hay pagos que referencian payment_statuses
    const paymentsCount = await client.query('SELECT COUNT(*) FROM payments');
    console.log(`Hay ${paymentsCount.rows[0].count} pagos en la base de datos`);
    
    // Limpiar y recrear con IDs correctos
    await client.query('DELETE FROM payment_statuses');
    
    for (const status of correctStatuses) {
      await client.query(
        `INSERT INTO payment_statuses (id, name, color_code, description, created_at) 
         VALUES ($1, $2, $3, $4, NOW())`,
        [status.id, status.name, status.color_code, status.description]
      );
    }
    
    // Reiniciar la secuencia para que el próximo ID sea 5
    await client.query(`SELECT setval('payment_statuses_id_seq', 4, true)`);
    
    await client.query('COMMIT');
    
    // Verificar resultado
    const updated = await client.query('SELECT * FROM payment_statuses ORDER BY id');
    console.log('\n✅ Estado actualizado:');
    updated.rows.forEach(row => console.log(`  ID ${row.id}: ${row.name}`));
    
    console.log('\n✅ Payment statuses arreglados correctamente!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixPaymentStatuses().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
