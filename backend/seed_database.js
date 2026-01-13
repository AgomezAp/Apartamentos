require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de datos iniciales...\n');

    // 1. Payment Statuses
    console.log('1. Creando estados de pago...');
    const paymentStatuses = [
      { id: 1, name: 'Pendiente', description: 'Pago pendiente de realizar' },
      { id: 2, name: 'Pagado', description: 'Pago completado' },
      { id: 3, name: 'Vencido', description: 'Pago vencido sin realizar' },
      { id: 4, name: 'Parcial', description: 'Pago parcialmente realizado' },
      { id: 5, name: 'Cancelado', description: 'Pago cancelado' }
    ];
    
    for (const status of paymentStatuses) {
      try {
        await pool.query(
          `INSERT INTO payment_statuses (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
          [status.id, status.name, status.description]
        );
      } catch (err) {
        // Ignorar si ya existe
      }
    }
    // Actualizar secuencia
    await pool.query(`SELECT setval('payment_statuses_id_seq', (SELECT MAX(id) FROM payment_statuses))`);
    console.log('   ✅ Estados de pago creados');

    // 2. Unit Types
    console.log('2. Creando tipos de unidad...');
    const unitTypes = [
      { name: 'Apartamento', description: 'Unidad tipo apartamento' },
      { name: 'Casa', description: 'Unidad tipo casa' },
      { name: 'Local Comercial', description: 'Local para uso comercial' },
      { name: 'Oficina', description: 'Espacio de oficina' },
      { name: 'Bodega', description: 'Espacio de almacenamiento' },
      { name: 'Estudio', description: 'Apartamento tipo estudio' },
      { name: 'Penthouse', description: 'Apartamento de lujo en último piso' }
    ];
    
    for (const type of unitTypes) {
      try {
        await pool.query(
          `INSERT INTO unit_types (name, description, is_active) VALUES ($1, $2, true) ON CONFLICT DO NOTHING`,
          [type.name, type.description]
        );
      } catch (err) {
        // Ignorar duplicados
      }
    }
    console.log('   ✅ Tipos de unidad creados');

    // 3. Service Types (para mantenimiento)
    console.log('3. Creando tipos de servicio...');
    const serviceTypes = [
      { name: 'Plomería', description: 'Servicios de plomería y fontanería' },
      { name: 'Electricidad', description: 'Servicios eléctricos' },
      { name: 'Pintura', description: 'Servicios de pintura' },
      { name: 'Carpintería', description: 'Servicios de carpintería' },
      { name: 'Cerrajería', description: 'Servicios de cerrajería' },
      { name: 'Electrodomésticos', description: 'Reparación de electrodomésticos' },
      { name: 'Limpieza', description: 'Servicios de limpieza' },
      { name: 'Aire Acondicionado', description: 'Mantenimiento de aire acondicionado' },
      { name: 'Jardinería', description: 'Servicios de jardinería' },
      { name: 'Otros', description: 'Otros servicios' }
    ];
    
    for (const type of serviceTypes) {
      try {
        await pool.query(
          `INSERT INTO service_types (name, description, is_active) VALUES ($1, $2, true) ON CONFLICT DO NOTHING`,
          [type.name, type.description]
        );
      } catch (err) {
        // Ignorar duplicados
      }
    }
    console.log('   ✅ Tipos de servicio creados');

    // 4. Expense Categories
    console.log('4. Creando categorías de gastos...');
    const expenseCategories = [
      { name: 'Mantenimiento', description: 'Gastos de mantenimiento general' },
      { name: 'Reparaciones', description: 'Gastos de reparaciones' },
      { name: 'Servicios Públicos', description: 'Agua, luz, gas, etc.' },
      { name: 'Administración', description: 'Gastos administrativos' },
      { name: 'Seguros', description: 'Pólizas de seguro' },
      { name: 'Impuestos', description: 'Impuestos y contribuciones' },
      { name: 'Limpieza', description: 'Servicios de limpieza' },
      { name: 'Seguridad', description: 'Servicios de seguridad' },
      { name: 'Jardinería', description: 'Mantenimiento de áreas verdes' },
      { name: 'Otros', description: 'Otros gastos' }
    ];
    
    for (const cat of expenseCategories) {
      try {
        await pool.query(
          `INSERT INTO expense_categories (name, description, is_active) VALUES ($1, $2, true) ON CONFLICT DO NOTHING`,
          [cat.name, cat.description]
        );
      } catch (err) {
        // Ignorar duplicados
      }
    }
    console.log('   ✅ Categorías de gastos creadas');

    // 5. Alert Types
    console.log('5. Creando tipos de alerta...');
    const alertTypes = [
      { name: 'payment_due', description: 'Pago próximo a vencer', template: 'El pago de {unit} vence en {days} días' },
      { name: 'payment_overdue', description: 'Pago vencido', template: 'El pago de {unit} está vencido por {days} días' },
      { name: 'contract_expiring', description: 'Contrato próximo a vencer', template: 'El contrato de {unit} vence en {days} días' },
      { name: 'maintenance_pending', description: 'Mantenimiento pendiente', template: 'Hay mantenimiento pendiente en {unit}' },
      { name: 'rent_increase', description: 'Aumento de renta programado', template: 'Aumento de renta programado para {unit}' }
    ];
    
    for (const type of alertTypes) {
      try {
        await pool.query(
          `INSERT INTO alert_types (name, description, template, is_active) VALUES ($1, $2, $3, true) ON CONFLICT DO NOTHING`,
          [type.name, type.description, type.template]
        );
      } catch (err) {
        // Ignorar duplicados
      }
    }
    console.log('   ✅ Tipos de alerta creados');

    // 6. Usuario administrador por defecto (opcional)
    console.log('6. Verificando usuario administrador...');
    const adminExists = await pool.query(`SELECT id FROM users WHERE email = 'admin@sistema.com'`);
    if (adminExists.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (email, password_hash, full_name, is_active) VALUES ($1, $2, $3, true)`,
        ['admin@sistema.com', '$2b$10$defaulthashfordevonly', 'Administrador']
      );
      console.log('   ✅ Usuario administrador creado (admin@sistema.com)');
    } else {
      console.log('   ⚠️ Usuario administrador ya existe');
    }

    console.log('\n✅ Seed completado exitosamente!');
    
    // Mostrar resumen
    const counts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM payment_statuses) as payment_statuses,
        (SELECT COUNT(*) FROM unit_types) as unit_types,
        (SELECT COUNT(*) FROM service_types) as service_types,
        (SELECT COUNT(*) FROM expense_categories) as expense_categories,
        (SELECT COUNT(*) FROM alert_types) as alert_types,
        (SELECT COUNT(*) FROM users) as users
    `);
    
    console.log('\n=== Resumen de datos ===');
    console.table(counts.rows[0]);

    await pool.end();
  } catch (error) {
    console.error('❌ Error en seed:', error);
    await pool.end();
    process.exit(1);
  }
}

seedDatabase();
