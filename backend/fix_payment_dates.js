const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'apartamentos',
  user: 'alejandroap',
  password: '0Ub9g5b'
});

async function fixPaymentDates() {
  try {
    // 1. Ver todos los pagos completados/parciales
    console.log('=== Pagos Completados/Parciales ===');
    const allPayments = await pool.query(`
      SELECT p.id, p.due_date, p.payment_date, p.amount_paid, ps.name as status
      FROM payments p
      JOIN payment_statuses ps ON p.payment_status_id = ps.id
      WHERE ps.name IN ('Pagado', 'Completado', 'Parcial')
      ORDER BY p.id
    `);
    console.table(allPayments.rows);

    // 2. Pagos sin payment_date
    console.log('\n=== Pagos sin payment_date ===');
    const needUpdate = await pool.query(`
      SELECT p.id, p.due_date, p.payment_date, p.amount_paid, ps.name as status
      FROM payments p
      JOIN payment_statuses ps ON p.payment_status_id = ps.id
      WHERE ps.name IN ('Pagado', 'Completado', 'Parcial')
        AND p.payment_date IS NULL
    `);
    console.log(`Encontrados: ${needUpdate.rows.length} pagos sin payment_date`);
    console.table(needUpdate.rows);

    if (needUpdate.rows.length > 0) {
      // 3. Actualizar los pagos sin payment_date
      console.log('\n=== Actualizando payment_date ===');
      const updateResult = await pool.query(`
        UPDATE payments 
        SET payment_date = CURRENT_DATE
        WHERE id IN (
          SELECT p.id FROM payments p
          JOIN payment_statuses ps ON p.payment_status_id = ps.id
          WHERE ps.name IN ('Pagado', 'Completado', 'Parcial')
            AND p.payment_date IS NULL
        )
        RETURNING id, payment_date
      `);
      console.log(`Actualizados: ${updateResult.rowCount} pagos`);
      console.table(updateResult.rows);
    }

    // 4. Verificar resultado final
    console.log('\n=== Verificación Final ===');
    const finalCheck = await pool.query(`
      SELECT p.id, p.due_date, p.payment_date, p.amount_paid, ps.name as status
      FROM payments p
      JOIN payment_statuses ps ON p.payment_status_id = ps.id
      WHERE ps.name IN ('Pagado', 'Completado', 'Parcial')
      ORDER BY p.id
    `);
    console.table(finalCheck.rows);

    // 5. Calcular total de ingresos para enero 2026
    console.log('\n=== Total Ingresos Enero 2026 ===');
    const totalIncome = await pool.query(`
      SELECT 
        COUNT(*) as cantidad_pagos,
        SUM(p.amount_paid) as total_ingresos
      FROM payments p
      JOIN payment_statuses ps ON p.payment_status_id = ps.id
      WHERE ps.name IN ('Pagado', 'Completado', 'Parcial')
        AND (
          (p.payment_date IS NOT NULL AND p.payment_date >= '2026-01-01' AND p.payment_date <= '2026-01-31')
          OR
          (p.payment_date IS NULL AND p.due_date >= '2026-01-01' AND p.due_date <= '2026-01-31')
        )
    `);
    console.table(totalIncome.rows);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

fixPaymentDates();
