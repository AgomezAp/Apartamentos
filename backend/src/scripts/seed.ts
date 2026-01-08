import pool from "../config/database";
import bcrypt from "bcrypt";

/**
 * Script de Seed - Datos Iniciales para Pruebas
 * Ejecutar: npx ts-node src/scripts/seed.ts
 */

async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

async function seed() {
  console.log("🌱 Iniciando seed de la base de datos...\n");

  try {
    // ========== 0. MIGRACIONES ==========
    console.log("🔧 0. Ejecutando migraciones necesarias...");
    
    // Agregar columnas de información del técnico si no existen
    await executeQuery(`
      ALTER TABLE maintenance_requests
      ADD COLUMN IF NOT EXISTS assigned_to_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS assigned_to_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS assigned_to_company VARCHAR(255),
      ADD COLUMN IF NOT EXISTS assigned_to_email VARCHAR(255);
    `);
    console.log("  ✅ Columnas de técnico agregadas");

    // Cambiar resolved_by de INT a VARCHAR
    await executeQuery(`
      ALTER TABLE maintenance_requests 
      DROP CONSTRAINT IF EXISTS maintenance_requests_resolved_by_fkey;
    `);
    await executeQuery(`
      ALTER TABLE maintenance_requests 
      ALTER COLUMN resolved_by TYPE VARCHAR(255) USING resolved_by::VARCHAR;
    `);
    console.log("  ✅ Columna resolved_by cambiada a VARCHAR\n");

    // Limpiar datos previos (truncate con cascade)
    console.log("🗑️  Limpiando datos previos...");
    await executeQuery(`
      TRUNCATE TABLE audit_logs CASCADE;
      TRUNCATE TABLE alerts CASCADE;
      TRUNCATE TABLE maintenance_requests CASCADE;
      TRUNCATE TABLE monthly_services CASCADE;
      TRUNCATE TABLE unit_services CASCADE;
      TRUNCATE TABLE payment_transactions CASCADE;
      TRUNCATE TABLE payments CASCADE;
      TRUNCATE TABLE contracts CASCADE;
      TRUNCATE TABLE tenants CASCADE;
      TRUNCATE TABLE units CASCADE;
      TRUNCATE TABLE building_unit_type_config CASCADE;
      TRUNCATE TABLE buildings CASCADE;
      TRUNCATE TABLE expenses CASCADE;
      TRUNCATE TABLE system_settings CASCADE;
    `);
    console.log("  ✅ Base de datos limpiada\n");

    // ========== 1. CATÁLOGOS ==========
    console.log("📋 1. Creando catálogos...");

    // Unit Types
    console.log("  → Tipos de unidad...");
    const unitTypes = [
      ["Apartamento", "Unidad residencial estándar"],
      ["Penthouse", "Apartamento de lujo en último piso"],
      ["Estudio", "Unidad pequeña de un ambiente"],
      ["Loft", "Espacio amplio de concepto abierto"],
      ["Dúplex", "Unidad de dos niveles"],
      ["Local Comercial", "Espacio para negocio"],
      ["Oficina", "Espacio de trabajo"],
      ["Parqueadero", "Plaza de estacionamiento"],
      ["Bodega", "Espacio de almacenamiento"],
    ];

    for (const [name, description] of unitTypes) {
      await executeQuery(
        "INSERT INTO unit_types (name, description, is_active, created_at, updated_at) VALUES ($1, $2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (name) DO NOTHING",
        [name, description]
      );
    }
    console.log("  ✅ Tipos de unidad creados");

    // Service Types
    console.log("  → Tipos de servicio...");
    const serviceTypes = [
      ["Agua", "Servicio de acueducto"],
      ["Electricidad", "Servicio de energía eléctrica"],
      ["Gas", "Servicio de gas natural"],
      ["Internet", "Servicio de internet"],
      ["Aseo", "Servicio de limpieza común"],
      ["Administración", "Cuota de administración"],
      ["Parqueadero", "Servicio de estacionamiento"],
      ["Vigilancia", "Servicio de seguridad y vigilancia"],
      ["Teléfono", "Servicio de telefonía fija"],
      ["Cable TV", "Servicio de televisión por cable"],
      ["Gimnasio", "Acceso a gimnasio del edificio"],
      ["Piscina", "Mantenimiento de piscina"],
      ["Ascensor", "Mantenimiento de ascensores"],
      ["Jardinería", "Mantenimiento de zonas verdes"],
    ];

    for (const [name, description] of serviceTypes) {
      await executeQuery(
        "INSERT INTO service_types (name, description, is_active, created_at, updated_at) VALUES ($1, $2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (name) DO NOTHING",
        [name, description]
      );
    }
    console.log("  ✅ Tipos de servicio creados");

    // Payment Statuses
    console.log("  → Estados de pago...");
    const paymentStatuses = [
      ["Pendiente", "Pago pendiente de realizar", "#FFA500"],
      ["Pagado", "Pago completado", "#00FF00"],
      ["Vencido", "Pago fuera de fecha", "#FF0000"],
      ["Parcial", "Pago incompleto", "#FFFF00"],
      ["Cancelado", "Pago anulado", "#808080"],
    ];

    for (const [name, description, color_code] of paymentStatuses) {
      await executeQuery(
        "INSERT INTO payment_statuses (name, description, color_code, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) ON CONFLICT (name) DO NOTHING",
        [name, description, color_code]
      );
    }
    console.log("  ✅ Estados de pago creados");

    // Alert Types - CORREGIDO: Agregado tipo "Mantenimiento"
    console.log("  → Tipos de alerta...");
    const alertTypes = [
      ["Pago Vencido", "Pago con fecha vencida", "💰", "#FF0000"],
      ["Contrato por Vencer", "Contrato próximo a finalizar", "📝", "#FFA500"],
      ["Unidad Desocupada", "Unidad sin inquilino", "🏠", "#FFFF00"],
      ["Capacidad Máxima", "Edificio en capacidad máxima", "⚠️", "#FF4500"],
      ["Mantenimiento", "Alerta de mantenimiento requerido", "🔧", "#0000FF"],
    ];

    for (const [name, description, icon, color] of alertTypes) {
      await executeQuery(
        "INSERT INTO alert_types (name, description, icon, color, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (name) DO NOTHING",
        [name, description, icon, color]
      );
    }
    console.log("  ✅ Tipos de alerta creados");

    // Users - Hashear contraseñas con bcrypt
    console.log("  → Usuarios...");
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const managerPasswordHash = await bcrypt.hash('manager123', 10);
    
    await executeQuery(
      `INSERT INTO users (email, password_hash, full_name, phone, is_active, created_at, updated_at) 
       VALUES ('agomez.desarrollo@andrespublicidadtg.com', $1, 'Administrador Sistema', '3001234567', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (email) DO NOTHING`,
      [adminPasswordHash]
    );
    await executeQuery(
      `INSERT INTO users (email, password_hash, full_name, phone, is_active, created_at, updated_at) 
       VALUES ('manager@apartamentos.com', $1, 'Gerente Operaciones', '3009876543', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (email) DO NOTHING`,
      [managerPasswordHash]
    );
    console.log("  ✅ Usuarios creados");

    // ========== 2. CATEGORÍAS DE GASTOS ==========
    console.log("\n💰 2. Creando categorías de gastos...");
    const expenseCategories = [
      ["Mantenimiento", "Reparaciones y mantenimiento general"],
      ["Servicios Públicos", "Agua, luz, gas de áreas comunes"],
      ["Seguridad", "Vigilancia y sistemas de seguridad"],
      ["Limpieza", "Aseo de áreas comunes"],
      ["Jardinería", "Mantenimiento de zonas verdes"],
      ["Administración", "Gastos administrativos"],
      ["Seguros", "Pólizas y seguros"],
      ["Impuestos", "Impuestos y tasas"],
      ["Reparaciones", "Arreglos y reparaciones"],
      ["Otros", "Gastos varios"],
    ];

    for (const [name, description] of expenseCategories) {
      await executeQuery(
        "INSERT INTO expense_categories (name, description, is_active, created_at, updated_at) VALUES ($1, $2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (name) DO NOTHING",
        [name, description]
      );
    }
    console.log("  ✅ Categorías de gastos creadas");

    // ========== 3. EDIFICIOS ==========
    console.log("\n🏢 3. Creando edificios...");
    const buildings = await executeQuery(`
      INSERT INTO buildings (name, address, city, state, postal_code, country, total_floors, total_units, max_capacity, construction_year, description, is_active, created_at, updated_at)
      VALUES 
        ('Torre Central', 'Calle 72 #10-34', 'Bogotá', 'Cundinamarca', '110221', 'Colombia', 15, 60, 60, 2020, 'Edificio moderno en zona norte con acabados de lujo', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('Edificio Los Andes', 'Carrera 7 #45-67', 'Bogotá', 'Cundinamarca', '110311', 'Colombia', 10, 40, 40, 2018, 'Edificio céntrico con parqueadero y seguridad 24/7', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('Residencias del Parque', 'Calle 100 #15-20', 'Bogotá', 'Cundinamarca', '110121', 'Colombia', 8, 32, 32, 2019, 'Edificio familiar cerca al parque con zonas verdes', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('Torres del Bosque', 'Carrera 15 #85-30', 'Bogotá', 'Cundinamarca', '110221', 'Colombia', 12, 48, 48, 2021, 'Moderno conjunto residencial con amenidades', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('Edificio Santa Ana', 'Calle 50 #12-45', 'Medellín', 'Antioquia', '050001', 'Colombia', 6, 24, 24, 2017, 'Edificio tradicional en el centro de Medellín', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT DO NOTHING
      RETURNING id, name, total_units
    `);
    console.log(`  ✅ ${buildings.length} edificios creados`);

    // ========== 4. UNIDADES ==========
    console.log("\n🏠 4. Creando unidades...");

    // Obtener IDs necesarios
    const apartamentoType = await executeQuery(
      "SELECT id FROM unit_types WHERE name = 'Apartamento' LIMIT 1"
    );
    const penthouseType = await executeQuery(
      "SELECT id FROM unit_types WHERE name = 'Penthouse' LIMIT 1"
    );
    const estudioType = await executeQuery(
      "SELECT id FROM unit_types WHERE name = 'Estudio' LIMIT 1"
    );

    const unitTypeId = apartamentoType[0].id;
    const penthouseTypeId = penthouseType[0].id;
    const estudioTypeId = estudioType[0].id;

    let unitCount = 0;

    // Torre Central - 60 unidades
    for (let floor = 1; floor <= 15; floor++) {
      for (let apt = 1; apt <= 4; apt++) {
        const unitNumber = `${floor}0${apt}`;
        const isPenthouse = floor === 15;
        const features = JSON.stringify({
          balcony: floor > 5,
          view: floor > 10 ? "panoramic" : floor > 5 ? "city" : "street",
          furnished: false,
        });

        await executeQuery(
          `
          INSERT INTO units (
            building_id, unit_type_id, unit_number, floor, area_sqm, bedrooms, bathrooms, 
            rental_price, occupation_status, description, features, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT DO NOTHING
        `,
          [
            buildings[0].id,
            isPenthouse ? penthouseTypeId : unitTypeId,
            unitNumber,
            floor,
            isPenthouse ? 120 : 65.5,
            isPenthouse ? 3 : 2,
            isPenthouse ? 3 : 2,
            isPenthouse ? 2500000 : 1200000,
            "vacant",
            `${isPenthouse ? "Penthouse" : "Apartamento"} en piso ${floor}`,
            features,
          ]
        );
        unitCount++;
      }
    }

    // Edificio Los Andes - 40 unidades
    for (let floor = 1; floor <= 10; floor++) {
      for (let apt = 1; apt <= 4; apt++) {
        const unitNumber = `${floor}0${apt}`;
        const features = JSON.stringify({
          balcony: apt === 1 || apt === 4,
          view: floor > 5 ? "city" : "street",
          furnished: false,
        });

        await executeQuery(
          `
          INSERT INTO units (
            building_id, unit_type_id, unit_number, floor, area_sqm, bedrooms, bathrooms, 
            rental_price, occupation_status, description, features, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT DO NOTHING
        `,
          [
            buildings[1].id,
            unitTypeId,
            unitNumber,
            floor,
            70,
            2,
            2,
            1300000,
            "vacant",
            `Apartamento en piso ${floor}`,
            features,
          ]
        );
        unitCount++;
      }
    }

    // Residencias del Parque - 32 unidades (estudios)
    for (let floor = 1; floor <= 8; floor++) {
      for (let apt = 1; apt <= 4; apt++) {
        const unitNumber = `${floor}0${apt}`;
        const features = JSON.stringify({
          balcony: true,
          view: "park",
          furnished: false,
        });

        await executeQuery(
          `
          INSERT INTO units (
            building_id, unit_type_id, unit_number, floor, area_sqm, bedrooms, bathrooms, 
            rental_price, occupation_status, description, features, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT DO NOTHING
        `,
          [
            buildings[2].id,
            estudioTypeId,
            unitNumber,
            floor,
            45,
            1,
            1,
            900000,
            "vacant",
            `Estudio en piso ${floor} - Vista al parque`,
            features,
          ]
        );
        unitCount++;
      }
    }

    console.log(`  ✅ ${unitCount} unidades creadas (${buildings[0].total_units} + ${buildings[1].total_units} + ${buildings[2].total_units} = ${buildings.reduce((sum, b) => sum + (b.total_units || 0), 0)})`);

    // ========== 5. INQUILINOS ==========
    console.log("\n👥 5. Creando inquilinos...");
    const tenants = await executeQuery(`
      INSERT INTO tenants (
        document_type, document_number, first_name, last_name, email, phone, mobile_phone,
        emergency_contact_name, emergency_contact_phone, occupation, company_name, monthly_income,
        notes, is_active, created_at, updated_at
      ) VALUES 
        ('CC', '1234567890', 'Juan', 'Pérez', 'juan.perez@email.com', '6012345678', '3101234567', 'María Pérez', '3109876543', 'Ingeniero de Software', 'Tech Corp SAS', 5000000, 'Cliente confiable', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('CC', '9876543210', 'Ana', 'García', 'ana.garcia@email.com', '6019876543', '3209876543', 'Carlos García', '3201234567', 'Médico', 'Hospital Central', 8000000, 'Excelente historial', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('CC', '5555555555', 'Carlos', 'Rodríguez', 'carlos.rodriguez@email.com', '6015555555', '3155555555', 'Laura Rodríguez', '3145555555', 'Contador', 'Contaduría Global', 4500000, 'Referencias verificadas', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('CC', '7777777777', 'Laura', 'Martínez', 'laura.martinez@email.com', '6017777777', '3177777777', 'Pedro Martínez', '3167777777', 'Arquitecta', 'Diseños Modernos', 6000000, 'Cliente puntual', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('CC', '2222222222', 'Pedro', 'López', 'pedro.lopez@email.com', '6012222222', '3122222222', 'Sandra López', '3132222222', 'Abogado', 'Bufete Legal', 7000000, 'Muy responsable', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('CC', '3333333333', 'María', 'González', 'maria.gonzalez@email.com', '6013333333', '3133333333', 'José González', '3143333333', 'Diseñadora Gráfica', 'Creativos SA', 4000000, 'Profesional creativa', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('CC', '4444444444', 'Roberto', 'Sánchez', 'roberto.sanchez@email.com', '6014444444', '3144444444', 'Carmen Sánchez', '3154444444', 'Gerente de Ventas', 'Comercial Ltda', 5500000, 'Buen pagador', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('CC', '6666666666', 'Patricia', 'Ramírez', 'patricia.ramirez@email.com', '6016666666', '3166666666', 'Miguel Ramírez', '3176666666', 'Profesora', 'Universidad Nacional', 4200000, 'Cliente estable', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('CC', '8888888888', 'Diego', 'Torres', 'diego.torres@email.com', '6018888888', '3188888888', 'Andrea Torres', '3198888888', 'Chef', 'Restaurante Gourmet', 3800000, 'Inquilino responsable', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('CC', '9999999999', 'Sofía', 'Vargas', 'sofia.vargas@email.com', '6019999999', '3199999999', 'Luis Vargas', '3109999999', 'Psicóloga', 'Centro de Salud', 4800000, 'Excelentes referencias', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('CC', '1111111111', 'Andrés', 'Moreno', 'andres.moreno@email.com', '6011111111', '3111111111', 'Claudia Moreno', '3121111111', 'Ingeniero Civil', 'Construcciones SA', 6500000, 'Inquilino modelo', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('CC', '1010101010', 'Valentina', 'Castro', 'valentina.castro@email.com', '6011010101', '3101010101', 'Ricardo Castro', '3111010101', 'Periodista', 'Canal de Noticias', 4600000, 'Puntual en pagos', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('CC', '2020202020', 'Felipe', 'Herrera', 'felipe.herrera@email.com', '6012020202', '3102020202', 'Natalia Herrera', '3112020202', 'Músico', 'Orquesta Sinfónica', 3500000, 'Artista responsable', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('CC', '3030303030', 'Carolina', 'Díaz', 'carolina.diaz@email.com', '6013030303', '3103030303', 'Mauricio Díaz', '3113030303', 'Veterinaria', 'Clínica Animal', 5200000, 'Excelente inquilina', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('CC', '4040404040', 'Santiago', 'Ramos', 'santiago.ramos@email.com', '6014040404', '3104040404', 'Luisa Ramos', '3114040404', 'Fotógrafo', 'Estudio Fotográfico', 4100000, 'Creativo y responsable', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT DO NOTHING
      RETURNING id, first_name, last_name
    `);
    console.log(`  ✅ ${tenants.length} inquilinos creados`);

    // ========== 6. CONTRATOS ==========
    console.log("\n📝 6. Creando contratos...");

    // Obtener unidades de diferentes edificios
    const torrecentralUnits = await executeQuery(`
      SELECT id, building_id, unit_number, rental_price 
      FROM units 
      WHERE building_id = $1 AND occupation_status = 'vacant'
      LIMIT 5
    `, [buildings[0].id]);

    const losandesUnits = await executeQuery(`
      SELECT id, building_id, unit_number, rental_price 
      FROM units 
      WHERE building_id = $1 AND occupation_status = 'vacant'
      LIMIT 3
    `, [buildings[1].id]);

    const parqueUnits = await executeQuery(`
      SELECT id, building_id, unit_number, rental_price 
      FROM units 
      WHERE building_id = $1 AND occupation_status = 'vacant'
      LIMIT 2
    `, [buildings[2].id]);

    const allAvailableUnits = [...torrecentralUnits, ...losandesUnits, ...parqueUnits];

    const contracts = [];
    const contractStatuses = ['active', 'active', 'active', 'active', 'active', 'active', 'active', 'pending', 'active', 'active'];
    const paymentDays = [5, 10, 1, 15, 5, 20, 10, 5, 1, 15];
    
    for (let i = 0; i < Math.min(tenants.length, allAvailableUnits.length); i++) {
      const startDate = i < 7 ? "2025-01-01" : "2025-02-01";
      const endDate = i < 7 ? "2025-12-31" : "2026-01-31";
      
      const contract = await executeQuery(
        `
        INSERT INTO contracts (
          unit_id, tenant_id, contract_number, start_date, end_date, monthly_rent, deposit_amount, 
          payment_day, status, rent_increase_percentage, rent_increase_frequency_months,
          notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, unit_id
      `,
        [
          allAvailableUnits[i].id,
          tenants[i].id,
          `CTR-${Date.now()}-${i + 1}`,
          startDate,
          endDate,
          allAvailableUnits[i].rental_price,
          allAvailableUnits[i].rental_price,
          paymentDays[i],
          contractStatuses[i],
          i % 2 === 0 ? 3.5 : 4.0,
          12,
          `Contrato ${contractStatuses[i]} para unidad ${allAvailableUnits[i].unit_number}`,
        ]
      );

      // Actualizar estado de la unidad solo si el contrato está activo
      if (contractStatuses[i] === 'active') {
        await executeQuery(
          `UPDATE units SET occupation_status = 'occupied', is_occupied = true WHERE id = $1`,
          [allAvailableUnits[i].id]
        );
      }

      contracts.push(contract[0]);
    }
    console.log(`  ✅ ${contracts.length} contratos creados (distribuidos entre edificios)`);

    // ========== 7. PAGOS ==========
    console.log("\n💳 7. Creando pagos de ejemplo...");

    const pendingStatus = await executeQuery(
      "SELECT id FROM payment_statuses WHERE name = 'Pendiente' LIMIT 1"
    );
    const paidStatus = await executeQuery(
      "SELECT id FROM payment_statuses WHERE name = 'Pagado' LIMIT 1"
    );
    const overdueStatus = await executeQuery(
      "SELECT id FROM payment_statuses WHERE name = 'Vencido' LIMIT 1"
    );
    const partialStatus = await executeQuery(
      "SELECT id FROM payment_statuses WHERE name = 'Parcial' LIMIT 1"
    );

    let paymentCount = 0;
    let transactionCount = 0;
    
    for (const contract of contracts) {
      // Obtener datos del contrato para el monto
      const contractData = await executeQuery(
        "SELECT monthly_rent FROM contracts WHERE id = $1",
        [contract.id]
      );
      const monthlyRent = contractData[0].monthly_rent;

      // Crear pagos de noviembre a marzo (5 meses)
      for (let month = 11; month <= 12; month++) {
        const paymentMethods = ['Transferencia', 'Efectivo', 'Tarjeta de Crédito', 'Cheque'];
        const payment = await executeQuery(
          `
          INSERT INTO payments (
            contract_id, period_month, period_year, amount_due, amount_paid,
            due_date, payment_date, payment_status_id, payment_method, notes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `,
          [
            contract.id,
            month,
            2024,
            monthlyRent,
            monthlyRent,
            `2024-${month.toString().padStart(2, "0")}-05`,
            `2024-${month.toString().padStart(2, "0")}-04`,
            paidStatus[0].id,
            paymentMethods[paymentCount % paymentMethods.length],
            `Pago completado de ${month === 11 ? "Noviembre" : "Diciembre"} 2024`,
          ]
        );

        // Crear transacción para cada pago realizado
        await executeQuery(
          `
          INSERT INTO payment_transactions (
            payment_id, transaction_type, amount, transaction_date, payment_method, reference_number,
            notes, created_by, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        `,
          [
            payment[0].id,
            "payment",
            monthlyRent,
            `2024-${month.toString().padStart(2, "0")}-04`,
            month % 2 === 0 ? "transferencia" : "efectivo",
            `TRX-2024${month.toString().padStart(2, "0")}-${(paymentCount + 1).toString().padStart(3, "0")}`,
            "Pago completo recibido",
            1,
          ]
        );
        transactionCount++;
        paymentCount++;
      }

      // Pagos de 2025
      for (let month = 1; month <= 3; month++) {
        let isPaid = false;
        let isPartial = false;
        let isOverdue = false;
        let status = pendingStatus[0].id;
        let amountPaid = 0;
        let paymentDate = null;

        // Diferentes escenarios de pago
        if (month === 1) {
          // Enero: todos pagados
          isPaid = true;
          status = paidStatus[0].id;
          amountPaid = monthlyRent;
          paymentDate = '2025-01-04';
        } else if (month === 2) {
          // Febrero: algunos pagados, algunos pendientes, algunos parciales
          if (paymentCount % 3 === 0) {
            isPaid = true;
            status = paidStatus[0].id;
            amountPaid = monthlyRent;
            paymentDate = '2025-02-03';
          } else if (paymentCount % 3 === 1) {
            isPartial = true;
            status = partialStatus[0].id;
            amountPaid = monthlyRent * 0.5;
            paymentDate = '2025-02-05';
          }
          // else pendiente
        } else if (month === 3) {
          // Marzo: algunos vencidos, algunos pendientes
          if (paymentCount % 4 === 0) {
            isOverdue = true;
            status = overdueStatus[0].id;
            amountPaid = 0;
          } else if (paymentCount % 4 === 1) {
            isPaid = true;
            status = paidStatus[0].id;
            amountPaid = monthlyRent;
            paymentDate = '2025-03-02';
          }
          // else pendiente
        }

        const paymentMethods = ['Transferencia', 'Efectivo', 'Tarjeta de Crédito', 'Cheque'];
        const payment = await executeQuery(
          `
          INSERT INTO payments (
            contract_id, period_month, period_year, amount_due, amount_paid,
            due_date, payment_date, payment_status_id, payment_method, notes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `,
          [
            contract.id,
            month,
            2025,
            monthlyRent,
            amountPaid,
            `2025-${month.toString().padStart(2, "0")}-05`,
            paymentDate,
            status,
            paymentMethods[paymentCount % paymentMethods.length],
            `Pago de ${month === 1 ? "Enero" : month === 2 ? "Febrero" : "Marzo"} 2025 - ${
              isPaid ? "Completado" : isPartial ? "Parcial" : isOverdue ? "Vencido" : "Pendiente"
            }`,
          ]
        );

        // Crear transacción si hay pago
        if (isPaid || isPartial) {
          await executeQuery(
            `
            INSERT INTO payment_transactions (
              payment_id, transaction_type, amount, transaction_date, payment_method, reference_number,
              notes, created_by, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
          `,
            [
              payment[0].id,
              "payment",
              amountPaid,
              paymentDate,
              paymentCount % 3 === 0 ? "transferencia" : paymentCount % 3 === 1 ? "efectivo" : "cheque",
              `TRX-2025${month.toString().padStart(2, "0")}-${(transactionCount + 1).toString().padStart(3, "0")}`,
              isPaid ? "Pago completo recibido" : "Pago parcial recibido",
              1,
            ]
          );
          transactionCount++;
        }

        paymentCount++;
      }
    }

    // Generar pagos futuros para 2025 completo, 2026 y 2027
    console.log("  📅 Generando pagos futuros (2025-2027)...");
    for (const contract of contracts) {
      const monthlyRent = Math.floor(Math.random() * 1500000) + 1000000;
      
      // Abril - Diciembre 2025
      for (let month = 4; month <= 12; month++) {
        await executeQuery(
          `
          INSERT INTO payments (
            contract_id, period_month, period_year, amount_due, amount_paid,
            due_date, payment_date, payment_status_id, payment_method, notes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `,
          [
            contract.id,
            month,
            2025,
            monthlyRent,
            0,
            `2025-${month.toString().padStart(2, "0")}-05`,
            null,
            pendingStatus[0].id,
            null,
            `Pago pendiente ${month}/2025`,
          ]
        );
        paymentCount++;
      }

      // Todo el año 2026
      for (let month = 1; month <= 12; month++) {
        await executeQuery(
          `
          INSERT INTO payments (
            contract_id, period_month, period_year, amount_due, amount_paid,
            due_date, payment_date, payment_status_id, payment_method, notes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `,
          [
            contract.id,
            month,
            2026,
            monthlyRent,
            0,
            `2026-${month.toString().padStart(2, "0")}-05`,
            null,
            pendingStatus[0].id,
            null,
            `Pago pendiente ${month}/2026`,
          ]
        );
        paymentCount++;
      }

      // Primer trimestre 2027
      for (let month = 1; month <= 3; month++) {
        await executeQuery(
          `
          INSERT INTO payments (
            contract_id, period_month, period_year, amount_due, amount_paid,
            due_date, payment_date, payment_status_id, payment_method, notes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `,
          [
            contract.id,
            month,
            2027,
            monthlyRent,
            0,
            `2027-${month.toString().padStart(2, "0")}-05`,
            null,
            pendingStatus[0].id,
            null,
            `Pago pendiente ${month}/2027`,
          ]
        );
        paymentCount++;
      }
    }
    
    console.log(`  ✅ ${paymentCount} pagos creados (históricos + futuros 2025-2027)`);
    console.log(`  ✅ ${transactionCount} transacciones de pago creadas`);

    // ========== 8. GASTOS ==========
    console.log("\n📊 8. Creando gastos de ejemplo...");

    const maintenanceCategory = await executeQuery(
      "SELECT id FROM expense_categories WHERE name = 'Mantenimiento' LIMIT 1"
    );
    const securityCategory = await executeQuery(
      "SELECT id FROM expense_categories WHERE name = 'Seguridad' LIMIT 1"
    );
    const cleaningCategory = await executeQuery(
      "SELECT id FROM expense_categories WHERE name = 'Limpieza' LIMIT 1"
    );
    const utilitiesCategory = await executeQuery(
      "SELECT id FROM expense_categories WHERE name = 'Servicios Públicos' LIMIT 1"
    );
    const gardenCategory = await executeQuery(
      "SELECT id FROM expense_categories WHERE name = 'Jardinería' LIMIT 1"
    );
    const insuranceCategory = await executeQuery(
      "SELECT id FROM expense_categories WHERE name = 'Seguros' LIMIT 1"
    );
    const taxesCategory = await executeQuery(
      "SELECT id FROM expense_categories WHERE name = 'Impuestos' LIMIT 1"
    );
    const adminCategory = await executeQuery(
      "SELECT id FROM expense_categories WHERE name = 'Administración' LIMIT 1"
    );

    const expensesData = [];
    
    // Gastos para cada edificio distribuidos en varios meses
    for (const building of buildings) {
      // Noviembre 2024
      expensesData.push(
        `(${building.id}, ${maintenanceCategory[0].id}, 'Mantenimiento preventivo ascensores', ${1500000 + Math.random() * 1000000}, '2024-11-05', 'transferencia', 'REF-NOV-${building.id}-001', 'Revisión técnica mensual', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${securityCategory[0].id}, 'Servicio de vigilancia noviembre', ${1200000 + Math.random() * 500000}, '2024-11-01', 'transferencia', 'REF-NOV-${building.id}-002', 'Nómina vigilancia', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${cleaningCategory[0].id}, 'Limpieza áreas comunes', ${800000 + Math.random() * 300000}, '2024-11-10', 'efectivo', 'REF-NOV-${building.id}-003', 'Servicio de aseo', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${utilitiesCategory[0].id}, 'Consumo de agua áreas comunes', ${600000 + Math.random() * 400000}, '2024-11-25', 'transferencia', 'REF-NOV-${building.id}-004', 'Factura servicios públicos', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      );
      
      // Diciembre 2024
      expensesData.push(
        `(${building.id}, ${maintenanceCategory[0].id}, 'Reparación bomba de agua', ${2500000 + Math.random() * 1500000}, '2024-12-08', 'cheque', 'CHQ-DIC-${building.id}-001', 'Cambio de bomba dañada', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${securityCategory[0].id}, 'Servicio de vigilancia diciembre', ${1200000 + Math.random() * 500000}, '2024-12-01', 'transferencia', 'REF-DIC-${building.id}-002', 'Nómina vigilancia + prima', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${gardenCategory[0].id}, 'Mantenimiento zonas verdes', ${450000 + Math.random() * 200000}, '2024-12-15', 'efectivo', 'REF-DIC-${building.id}-003', 'Poda y jardinería', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${cleaningCategory[0].id}, 'Limpieza profunda fin de año', ${1200000 + Math.random() * 500000}, '2024-12-20', 'transferencia', 'REF-DIC-${building.id}-004', 'Limpieza especial navidad', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${insuranceCategory[0].id}, 'Póliza anual edificio', ${3500000 + Math.random() * 2000000}, '2024-12-10', 'transferencia', 'POL-2024-${building.id}', 'Renovación seguro edificio', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      );
      
      // Enero 2025
      expensesData.push(
        `(${building.id}, ${maintenanceCategory[0].id}, 'Pintura fachada', ${4500000 + Math.random() * 2000000}, '2025-01-15', 'transferencia', 'REF-ENE-${building.id}-001', 'Mejora de imagen', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${securityCategory[0].id}, 'Servicio de vigilancia enero', ${1300000 + Math.random() * 500000}, '2025-01-01', 'transferencia', 'REF-ENE-${building.id}-002', 'Nómina vigilancia', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${cleaningCategory[0].id}, 'Limpieza áreas comunes', ${850000 + Math.random() * 300000}, '2025-01-10', 'efectivo', 'REF-ENE-${building.id}-003', 'Servicio de aseo', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${utilitiesCategory[0].id}, 'Electricidad áreas comunes', ${1200000 + Math.random() * 600000}, '2025-01-25', 'transferencia', 'REF-ENE-${building.id}-004', 'Consumo iluminación', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${adminCategory[0].id}, 'Papelería y suministros', ${250000 + Math.random() * 150000}, '2025-01-12', 'efectivo', 'REF-ENE-${building.id}-005', 'Suministros oficina', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      );
      
      // Febrero 2025
      expensesData.push(
        `(${building.id}, ${maintenanceCategory[0].id}, 'Mantenimiento ascensores', ${1600000 + Math.random() * 800000}, '2025-02-05', 'transferencia', 'REF-FEB-${building.id}-001', 'Servicio técnico', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${securityCategory[0].id}, 'Servicio de vigilancia febrero', ${1300000 + Math.random() * 500000}, '2025-02-01', 'transferencia', 'REF-FEB-${building.id}-002', 'Nómina vigilancia', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${cleaningCategory[0].id}, 'Limpieza de tanques de agua', ${950000 + Math.random() * 400000}, '2025-02-18', 'cheque', 'CHQ-FEB-${building.id}-001', 'Limpieza sanitaria', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${taxesCategory[0].id}, 'Impuesto predial', ${2800000 + Math.random() * 1200000}, '2025-02-28', 'transferencia', 'PRED-2025-${building.id}', 'Impuesto anual', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      );
      
      // Marzo 2025
      expensesData.push(
        `(${building.id}, ${maintenanceCategory[0].id}, 'Reparación portón eléctrico', ${1800000 + Math.random() * 700000}, '2025-03-10', 'transferencia', 'REF-MAR-${building.id}-001', 'Cambio motor portón', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${securityCategory[0].id}, 'Servicio de vigilancia marzo', ${1350000 + Math.random() * 500000}, '2025-03-01', 'transferencia', 'REF-MAR-${building.id}-002', 'Nómina vigilancia', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${cleaningCategory[0].id}, 'Limpieza áreas comunes', ${880000 + Math.random() * 350000}, '2025-03-15', 'efectivo', 'REF-MAR-${building.id}-003', 'Servicio de aseo', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${building.id}, ${gardenCategory[0].id}, 'Fumigación y control de plagas', ${680000 + Math.random() * 320000}, '2025-03-20', 'transferencia', 'REF-MAR-${building.id}-004', 'Fumigación trimestral', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      );
    }

    const expensesQuery = `
      INSERT INTO expenses (
        building_id, category_id, description, amount, expense_date, payment_method,
        reference_number, notes, created_by, created_at, updated_at
      ) VALUES ${expensesData.join(',\n')}
      RETURNING id
    `;
    
    const expenses = await executeQuery(expensesQuery);
    console.log(`  ✅ ${expenses.length} gastos creados (distribuidos en 5 meses y ${buildings.length} edificios)`);

    // ========== 9. SYSTEM SETTINGS ==========
    console.log("\n⚙️  9. Creando configuraciones del sistema...");

    const settings = await executeQuery(`
      INSERT INTO system_settings (
        setting_key, setting_value, data_type, description, category, is_editable, created_at, updated_at
      ) VALUES 
        ('contract_min_duration_months', '6', 'number', 'Duración mínima del contrato en meses', 'contracts', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('contract_max_duration_months', '24', 'number', 'Duración máxima del contrato en meses', 'contracts', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('contract_renewal_notice_days', '60', 'number', 'Días de aviso previo para renovación', 'contracts', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('late_payment_fee_percentage', '5', 'number', 'Porcentaje de mora por pago tardío', 'payments', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('payment_grace_period_days', '3', 'number', 'Días de gracia para pago sin mora', 'payments', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('payment_due_reminder_days', '5', 'number', 'Días antes del vencimiento para recordatorio', 'payments', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('max_upload_file_size_mb', '10', 'number', 'Tamaño máximo de archivo en MB', 'uploads', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('allowed_file_extensions', '["pdf","jpg","jpeg","png","doc","docx","xlsx"]', 'json', 'Extensiones de archivo permitidas', 'uploads', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('company_name', 'Gestión de Apartamentos', 'string', 'Nombre de la compañía', 'general', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('company_email', 'info@apartamentos.com', 'string', 'Email de contacto', 'general', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('company_phone', '601-2345678', 'string', 'Teléfono de contacto', 'general', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('company_address', 'Calle 100 #15-20, Bogotá', 'string', 'Dirección de la empresa', 'general', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('enable_email_notifications', 'true', 'boolean', 'Habilitar notificaciones por email', 'notifications', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('enable_sms_notifications', 'false', 'boolean', 'Habilitar notificaciones por SMS', 'notifications', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('alert_expiring_contracts_days', '30', 'number', 'Días antes para alertar contratos por vencer', 'notifications', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('alert_vacant_units_days', '15', 'number', 'Días que debe estar vacía una unidad para alertar', 'notifications', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('maintenance_priority_high_hours', '24', 'number', 'Horas máximas para atender mantenimiento prioritario', 'maintenance', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('maintenance_priority_medium_hours', '72', 'number', 'Horas máximas para atender mantenimiento medio', 'maintenance', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('backup_frequency_days', '7', 'number', 'Frecuencia de respaldos en días', 'system', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('session_timeout_minutes', '60', 'number', 'Tiempo de inactividad antes de cerrar sesión', 'security', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (setting_key) DO NOTHING
      RETURNING id
    `);
    console.log(`  ✅ ${settings.length} configuraciones creadas`);

    // ========== 10. UNIT SERVICES ==========
    console.log("\n🔌 10. Asignando servicios a unidades...");

    const aguaId = await executeQuery(
      "SELECT id FROM service_types WHERE name = 'Agua' LIMIT 1"
    );
    const electricidadId = await executeQuery(
      "SELECT id FROM service_types WHERE name = 'Electricidad' LIMIT 1"
    );
    const administracionId = await executeQuery(
      "SELECT id FROM service_types WHERE name = 'Administración' LIMIT 1"
    );
    const gasId = await executeQuery(
      "SELECT id FROM service_types WHERE name = 'Gas' LIMIT 1"
    );
    const internetId = await executeQuery(
      "SELECT id FROM service_types WHERE name = 'Internet' LIMIT 1"
    );
    const vigilanciaId = await executeQuery(
      "SELECT id FROM service_types WHERE name = 'Vigilancia' LIMIT 1"
    );
    const aseoId = await executeQuery(
      "SELECT id FROM service_types WHERE name = 'Aseo' LIMIT 1"
    );

    // Obtener TODAS las unidades ocupadas para asignarles servicios
    const occupiedUnits = await executeQuery(
      "SELECT id FROM units WHERE occupation_status = 'occupied'"
    );

    let serviceCount = 0;
    for (const unit of occupiedUnits) {
      // Servicios básicos incluidos para todos
      const basicServices = [
        [unit.id, aguaId[0].id, true, 0, 'Servicio incluido en arriendo'],
        [unit.id, electricidadId[0].id, true, 0, 'Servicio incluido en arriendo'],
        [unit.id, administracionId[0].id, true, 0, 'Cuota de administración incluida'],
        [unit.id, vigilanciaId[0].id, true, 0, 'Seguridad 24/7 incluida'],
        [unit.id, aseoId[0].id, true, 0, 'Limpieza áreas comunes incluida'],
      ];

      // Servicios opcionales (algunos incluidos, otros con costo adicional)
      const optionalServices = [
        [unit.id, gasId[0].id, serviceCount % 3 === 0, serviceCount % 3 !== 0 ? 50000 : 0, serviceCount % 3 === 0 ? 'Gas incluido' : 'Gas adicional'],
        [unit.id, internetId[0].id, serviceCount % 2 === 0, serviceCount % 2 !== 0 ? 80000 : 0, serviceCount % 2 === 0 ? 'Internet incluido' : 'Internet fibra óptica'],
      ];

      for (const [unitId, serviceId, isIncluded, cost, notes] of [...basicServices, ...optionalServices]) {
        await executeQuery(
          `
          INSERT INTO unit_services (unit_id, service_type_id, is_included, additional_cost, notes, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (unit_id, service_type_id) DO NOTHING
        `,
          [unitId, serviceId, isIncluded, cost, notes]
        );
        serviceCount++;
      }
    }
    console.log(`  ✅ ${serviceCount} servicios asignados a ${occupiedUnits.length} unidades ocupadas`);

    // ========== 11. MONTHLY SERVICES ==========
    console.log("\n📅 11. Registrando consumos mensuales de servicios...");

    const monthlyServicesData = [];
    
    // Generar consumos mensuales para los últimos 5 meses (Nov 2024 - Mar 2025)
    const months = [
      { month: 11, year: 2024, name: 'Noviembre' },
      { month: 12, year: 2024, name: 'Diciembre' },
      { month: 1, year: 2025, name: 'Enero' },
      { month: 2, year: 2025, name: 'Febrero' },
      { month: 3, year: 2025, name: 'Marzo' }
    ];

    for (const period of months) {
      for (const building of buildings) {
        const baseAguaCost = building.total_units * 45000;
        const baseElectricidadCost = building.total_units * 120000;
        const baseGasCost = building.total_units * 35000;
        
        // Agua
        monthlyServicesData.push(
          `(${building.id}, ${aguaId[0].id}, ${period.month}, ${period.year}, ${baseAguaCost + Math.random() * baseAguaCost * 0.3}, ${(baseAguaCost / building.total_units).toFixed(2)}, '${period.year}-${period.month.toString().padStart(2, '0')}-25', 'Consumo ${period.name} - ${building.name}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        );
        
        // Electricidad
        monthlyServicesData.push(
          `(${building.id}, ${electricidadId[0].id}, ${period.month}, ${period.year}, ${baseElectricidadCost + Math.random() * baseElectricidadCost * 0.4}, ${(baseElectricidadCost / building.total_units).toFixed(2)}, '${period.year}-${period.month.toString().padStart(2, '0')}-25', 'Consumo ${period.name} - ${building.name}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        );
        
        // Gas
        monthlyServicesData.push(
          `(${building.id}, ${gasId[0].id}, ${period.month}, ${period.year}, ${baseGasCost + Math.random() * baseGasCost * 0.25}, ${(baseGasCost / building.total_units).toFixed(2)}, '${period.year}-${period.month.toString().padStart(2, '0')}-26', 'Consumo ${period.name} - ${building.name}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        );
        
        // Internet (solo algunos edificios)
        if (building.id <= 3) {
          const baseInternetCost = building.total_units * 95000;
          monthlyServicesData.push(
            `(${building.id}, ${internetId[0].id}, ${period.month}, ${period.year}, ${baseInternetCost}, ${(baseInternetCost / building.total_units).toFixed(2)}, '${period.year}-${period.month.toString().padStart(2, '0')}-20', 'Internet fibra ${period.name} - ${building.name}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
          );
        }
      }
    }

    const monthlyServicesQuery = `
      INSERT INTO monthly_services (
        building_id, service_type_id, month, year, total_cost, cost_per_unit, 
        reading_date, notes, created_at, updated_at
      ) VALUES ${monthlyServicesData.join(',\n')}
      RETURNING id
    `;
    
    const monthlyServices = await executeQuery(monthlyServicesQuery);
    console.log(
      `  ✅ ${monthlyServices.length} registros de consumo mensual creados (5 meses × ${buildings.length} edificios × 3-4 servicios)`
    );

    // ========== 12. BUILDING UNIT TYPE CONFIG ==========
    console.log("\n🏗️  12. Configurando tipos de unidad por edificio...");

    const apartamentoTypeConfig = await executeQuery(
      "SELECT id FROM unit_types WHERE name = 'Apartamento' LIMIT 1"
    );
    const penthouseTypeConfig = await executeQuery(
      "SELECT id FROM unit_types WHERE name = 'Penthouse' LIMIT 1"
    );
    const loftTypeConfig = await executeQuery(
      "SELECT id FROM unit_types WHERE name = 'Loft' LIMIT 1"
    );
    const duplexTypeConfig = await executeQuery(
      "SELECT id FROM unit_types WHERE name = 'Dúplex' LIMIT 1"
    );

    const buildingConfigsData = [];
    
    // Torre Central - Apartamentos y Penthouses
    buildingConfigsData.push(
      `(${buildings[0].id}, ${apartamentoTypeConfig[0].id}, 55, 1200000, 150000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      `(${buildings[0].id}, ${penthouseTypeConfig[0].id}, 5, 2500000, 300000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    );
    
    // Edificio Los Andes - Solo Apartamentos
    buildingConfigsData.push(
      `(${buildings[1].id}, ${apartamentoTypeConfig[0].id}, 40, 1300000, 160000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    );
    
    // Residencias del Parque - Estudios
    buildingConfigsData.push(
      `(${buildings[2].id}, ${estudioTypeId}, 32, 900000, 100000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    );

    // Si hay más edificios, configurarlos también
    if (buildings.length > 3) {
      buildingConfigsData.push(
        `(${buildings[3].id}, ${apartamentoTypeConfig[0].id}, 36, 1400000, 170000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${buildings[3].id}, ${loftTypeConfig[0].id}, 12, 1800000, 220000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      );
    }
    
    if (buildings.length > 4) {
      buildingConfigsData.push(
        `(${buildings[4].id}, ${apartamentoTypeConfig[0].id}, 20, 1100000, 140000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        `(${buildings[4].id}, ${duplexTypeConfig[0].id}, 4, 2200000, 280000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      );
    }

    const buildingConfigsQuery = `
      INSERT INTO building_unit_type_config (
        building_id, unit_type_id, quantity, base_rent, base_admin_fee, created_at, updated_at
      ) VALUES ${buildingConfigsData.join(',\n')}
      ON CONFLICT (building_id, unit_type_id) DO NOTHING
      RETURNING building_id, unit_type_id
    `;
    
    const buildingConfigs = await executeQuery(buildingConfigsQuery);
    console.log(
      `  ✅ ${buildingConfigs.length} configuraciones de edificio creadas`
    );

    // ========== 13. ALERTS ==========
    console.log("\n🔔 13. Creando alertas de ejemplo...");
    
    // NOTA IMPORTANTE: En un sistema real, las alertas se crean AUTOMÁTICAMENTE mediante:
    // 
    // 1. ALERTAS DE RECORDATORIO MENSUAL (CRON JOB):
    //    - Se ejecuta diariamente a las 6:00 AM
    //    - Revisa todos los pagos con due_date en los próximos 5 días
    //    - Genera alerta de recordatorio: "Recordatorio de Pago - Vence en X días"
    //    - Se envía email/SMS al inquilino automáticamente
    // 
    // 2. ALERTAS DE PAGO VENCIDO (CRON JOB):
    //    - Se ejecuta diariamente a las 8:00 AM
    //    - Revisa pagos con due_date < fecha actual y status = 'Pendiente'
    //    - Cambia status a 'Vencido' automáticamente
    //    - Genera alerta de "Pago Vencido" para administrador
    // 
    // 3. ALERTAS DE CONTRATO (CRON JOB):
    //    - Se ejecuta semanalmente
    //    - Busca contratos con end_date en próximos 60 días
    //    - Genera alerta "Contrato por Vencer" para renovación
    // 
    // 4. ALERTAS DE MANTENIMIENTO (TRIGGER):
    //    - Se crea automáticamente al insertar maintenance_request
    //    - Notifica a equipo de mantenimiento según prioridad
    // 
    // 5. ALERTAS DE CAPACIDAD (TRIGGER):
    //    - Se activa cuando ocupancy_rate > 95%
    // 
    // Para el seed, creamos algunas alertas de PRUEBA que simulan el comportamiento automático
    
    const pagoVencidoType = await executeQuery(
      "SELECT id FROM alert_types WHERE name = 'Pago Vencido' LIMIT 1"
    );
    const contractAlertType = await executeQuery(
      "SELECT id FROM alert_types WHERE name = 'Contrato por Vencer' LIMIT 1"
    );
    const unidadDesocupadaType = await executeQuery(
      "SELECT id FROM alert_types WHERE name = 'Unidad Desocupada' LIMIT 1"
    );
    const maintenanceAlertType = await executeQuery(
      "SELECT id FROM alert_types WHERE name = 'Mantenimiento' LIMIT 1"
    );

    const alerts = [];
    
    // Alertas de pagos vencidos (automáticas en sistema real)
    if (pagoVencidoType.length > 0) {
      const overduePayments = await executeQuery(`
        SELECT p.id, p.contract_id, c.unit_id, u.building_id
        FROM payments p
        INNER JOIN contracts c ON p.contract_id = c.id
        INNER JOIN units u ON c.unit_id = u.id
        WHERE p.payment_status_id = (SELECT id FROM payment_statuses WHERE name = 'Vencido' LIMIT 1)
        LIMIT 3
      `);

      for (const payment of overduePayments) {
        const alert = await executeQuery(`
          INSERT INTO alerts (
            alert_type_id, title, message, priority, is_read, is_resolved, 
            building_id, unit_id, contract_id, payment_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `, [
          pagoVencidoType[0].id,
          'Pago Vencido - Acción Requerida',
          `El pago ${payment.id} se encuentra vencido. Se requiere seguimiento inmediato.`,
          'high',
          false,
          false,
          payment.building_id,
          payment.unit_id,
          payment.contract_id,
          payment.id
        ]);
        alerts.push(...alert);
      }
    }
    
    // Alertas de contratos por vencer (automáticas en sistema real - cron job diario)
    if (contractAlertType.length > 0) {
      const expiringContracts = await executeQuery(`
        SELECT c.id, c.unit_id, u.building_id, c.end_date
        FROM contracts c
        INNER JOIN units u ON c.unit_id = u.id
        WHERE c.status = 'active' AND c.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'
        LIMIT 2
      `);

      for (const contract of expiringContracts) {
        const alert = await executeQuery(`
          INSERT INTO alerts (
            alert_type_id, title, message, priority, is_read, is_resolved, 
            building_id, unit_id, contract_id, payment_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `, [
          contractAlertType[0].id,
          'Contrato Próximo a Vencer',
          `El contrato ${contract.id} vence el ${contract.end_date}. Programar renovación o notificar.`,
          'medium',
          false,
          false,
          contract.building_id,
          contract.unit_id,
          contract.id
        ]);
        alerts.push(...alert);
      }
    }

    // Alertas de unidades desocupadas (automáticas - se crean al finalizar contrato)
    if (unidadDesocupadaType.length > 0) {
      const vacantUnits = await executeQuery(`
        SELECT u.id, u.building_id, u.unit_number
        FROM units u
        WHERE u.occupation_status = 'vacant' AND u.is_active = true
        LIMIT 5
      `);

      for (let i = 0; i < Math.min(2, vacantUnits.length); i++) {
        const alert = await executeQuery(`
          INSERT INTO alerts (
            alert_type_id, title, message, priority, is_read, is_resolved, 
            building_id, unit_id, contract_id, payment_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `, [
          unidadDesocupadaType[0].id,
          'Unidad Disponible para Arrendar',
          `La unidad ${vacantUnits[i].unit_number} se encuentra desocupada y disponible.`,
          'low',
          i === 0 ? true : false,
          i === 0 ? true : false,
          vacantUnits[i].building_id,
          vacantUnits[i].id
        ]);
        alerts.push(...alert);
      }
    }

    // Alertas de mantenimiento (se crean cuando se registra solicitud de mantenimiento)
    if (maintenanceAlertType.length > 0) {
      const maintenanceAlerts = await executeQuery(`
        INSERT INTO alerts (
          alert_type_id, title, message, priority, is_read, is_resolved, 
          building_id, unit_id, contract_id, payment_id, created_at, updated_at
        ) VALUES 
          ($1, $2, $3, $4, $5, $6, $7, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ($8, $9, $10, $11, $12, $13, $14, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `, [
        maintenanceAlertType[0].id,
        'Revisión de Ascensor Pendiente',
        'Se requiere inspección técnica del ascensor principal - Torre Central',
        'high',
        false,
        false,
        buildings[0].id,
        maintenanceAlertType[0].id,
        'Revisión de Extintores',
        'Inspección anual de extintores vencida - Edificio Los Andes',
        'high',
        false,
        false,
        buildings.length > 1 ? buildings[1].id : buildings[0].id
      ]);
      alerts.push(...maintenanceAlerts);
    }

    console.log(`  ✅ ${alerts.length} alertas de PRUEBA creadas`);
    console.log(`  ℹ️  En producción, las alertas se crean AUTOMÁTICAMENTE por:`);
    console.log(`      • Cron job diario: Recordatorios 5 días antes de vencimiento`);
    console.log(`      • Cron job diario: Cambio a 'Vencido' cuando pasa due_date`);
    console.log(`      • Cron job semanal: Contratos próximos a vencer`);
    console.log(`      • Trigger: Al crear solicitud de mantenimiento`);
    console.log(`      • Trigger: Al desocupar unidad`);

    // ========== 14. MAINTENANCE REQUESTS ==========
    console.log("\n🔧 14. Creando solicitudes de mantenimiento...");

    // Obtener unidades ocupadas con sus inquilinos
    const unitsWithTenants = await executeQuery(`
      SELECT u.id as unit_id, c.tenant_id 
      FROM units u
      INNER JOIN contracts c ON u.id = c.unit_id
      WHERE c.status = 'active'
      LIMIT 15
    `);

    const maintenanceCategories = [
      'Plomería', 'Electricidad', 'Pintura', 'Carpintería', 
      'Aire Acondicionado', 'Cerrajería', 'Limpieza', 'Electrodomésticos',
      'Ventanas', 'Pisos', 'Techos', 'Puertas', 'Calefacción', 'Gas', 'Herrería'
    ];
    
    const maintenanceDescriptions = [
      'Fuga de agua en la cocina que requiere atención inmediata',
      'Falla en el sistema eléctrico del apartamento',
      'Paredes necesitan repintura por humedad',
      'Reparación de gabinetes de cocina dañados',
      'Aire acondicionado no enfría correctamente',
      'Cerradura de puerta principal dañada',
      'Limpieza profunda después de reparaciones',
      'Nevera no está funcionando correctamente',
      'Ventanas no cierran herméticamente',
      'Reparación de baldosas sueltas en el baño',
      'Goteras en el techo durante lluvias',
      'Puerta del balcón no abre/cierra bien',
      'Sistema de calefacción hace ruido',
      'Olor a gas en la cocina - urgente',
      'Barandas del balcón oxidadas y flojas'
    ];
    
    const maintenancePriorities = ['low', 'medium', 'high', 'high', 'medium', 'low', 'medium', 'high', 'medium', 'low', 'high', 'medium', 'high', 'urgent', 'high'];
    const maintenanceStatuses = ['pending', 'in_progress', 'completed', 'completed', 'in_progress', 'pending', 'completed', 'pending', 'in_progress', 'completed', 'pending', 'in_progress', 'completed', 'pending', 'in_progress'];

    const maintenanceRequests = [];
    
    if (unitsWithTenants.length > 0) {
      for (let i = 0; i < Math.min(15, unitsWithTenants.length); i++) {
        const isCompleted = maintenanceStatuses[i] === 'completed';
        const isInProgress = maintenanceStatuses[i] === 'in_progress';
        
        // Fechas variadas
        const reportedDates = [
          '2024-12-15', '2024-12-20', '2025-01-05', '2025-01-08', '2025-01-10',
          '2025-01-12', '2025-01-15', '2025-01-18', '2025-01-20', '2025-01-22',
          '2025-01-25', '2025-02-01', '2025-02-05', '2025-02-10', '2025-02-12'
        ];
        
        const request = await executeQuery(
          `
          INSERT INTO maintenance_requests (
            unit_id, tenant_id, title, description, priority, status, category,
            reported_date, scheduled_date, completed_date, assigned_to, assigned_to_name,
            assigned_to_phone, assigned_to_company, assigned_to_email, resolved_by,
            estimated_cost, actual_cost, notes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `,
          [
            unitsWithTenants[i % unitsWithTenants.length].unit_id,
            unitsWithTenants[i % unitsWithTenants.length].tenant_id,
            `${maintenanceCategories[i]} - Unidad ${unitsWithTenants[i % unitsWithTenants.length].unit_id}`,
            maintenanceDescriptions[i],
            maintenancePriorities[i],
            maintenanceStatuses[i],
            maintenanceCategories[i],
            reportedDates[i],
            isInProgress || isCompleted ? reportedDates[i].replace(/\d{2}$/, (d) => String(Number(d) + 3).padStart(2, '0')) : null,
            isCompleted ? reportedDates[i].replace(/\d{2}$/, (d) => String(Number(d) + 7).padStart(2, '0')) : null,
            null, // assigned_to (dejarlo null para usar los campos de tercero)
            isInProgress || isCompleted ? (i % 3 === 0 ? 'Juan Pérez Técnico' : i % 3 === 1 ? 'María García' : 'Pedro López') : null, // assigned_to_name
            isInProgress || isCompleted ? (i % 3 === 0 ? '3001234567' : i % 3 === 1 ? '3109876543' : '3157654321') : null, // assigned_to_phone
            isInProgress || isCompleted ? (i % 3 === 0 ? 'Servicios Técnicos SAS' : i % 3 === 1 ? 'Mantenimientos Bogotá' : 'Reparaciones Express') : null, // assigned_to_company
            isInProgress || isCompleted ? (i % 3 === 0 ? 'juan.perez@servicios.com' : i % 3 === 1 ? 'maria@mantenimientos.com' : 'pedro@reparaciones.com') : null, // assigned_to_email
            isCompleted ? (i % 2 === 0 ? 1 : 2) : null,
            (i + 1) * 150000 + Math.floor(Math.random() * 200000),
            isCompleted ? (i + 1) * 140000 + Math.floor(Math.random() * 180000) : null,
            isCompleted ? 'Trabajo completado satisfactoriamente. Cliente conforme.' : 
            isInProgress ? `En proceso de reparación. Técnico asignado. ${Math.floor(Math.random() * 60) + 20}% completado.` : 
            'Pendiente de asignación y programación',
          ]
        );
        maintenanceRequests.push(request[0]);
      }
    }
    
    console.log(`  ✅ ${maintenanceRequests.length} solicitudes de mantenimiento creadas`);

    // ========== RESUMEN ==========
    console.log("\n" + "=".repeat(50));
    console.log("✨ SEED COMPLETADO EXITOSAMENTE ✨");
    console.log("=".repeat(50));
    console.log("\n📊 Resumen COMPLETO de datos creados:");
    console.log(`\n🔧 CATÁLOGOS Y CONFIGURACIÓN:`);
    console.log(`  • ${unitTypes.length} tipos de unidad`);
    console.log(`  • ${serviceTypes.length} tipos de servicio`);
    console.log(`  • ${paymentStatuses.length} estados de pago`);
    console.log(`  • ${alertTypes.length} tipos de alerta`);
    console.log(`  • ${expenseCategories.length} categorías de gastos`);
    console.log(`  • ${settings.length} configuraciones del sistema`);
    
    console.log(`\n👥 USUARIOS Y ACCESO:`);
    const userCount = await executeQuery("SELECT COUNT(*) as count FROM users");
    console.log(`  • ${userCount[0].count} usuarios del sistema`);
    
    console.log(`\n🏢 INFRAESTRUCTURA:`);
    console.log(`  • ${buildings.length} edificios:`);
    for (const building of buildings) {
      console.log(`    - ${building.name}: ${building.total_units} unidades`);
    }
    console.log(`  • ${unitCount} unidades en total`);
    console.log(`  • ${buildingConfigs.length} configuraciones de tipos por edificio`);
    
    console.log(`\n👨‍👩‍👧‍👦 INQUILINOS Y CONTRATOS:`);
    console.log(`  • ${tenants.length} inquilinos registrados`);
    console.log(`  • ${contracts.length} contratos (activos y pendientes)`);
    
    console.log(`\n💰 PAGOS Y TRANSACCIONES:`);
    console.log(`  • ${paymentCount} registros de pagos (2024-2027)`);
    console.log(`  • ${transactionCount} transacciones de pago registradas`);
    console.log(`  ℹ️  Incluye historial 2024-2025 y pagos futuros hasta Q1 2027`);
    
    console.log(`\n📊 GASTOS Y SERVICIOS:`);
    console.log(`  • ${expenses.length} gastos registrados (${buildings.length} edificios × 5 meses)`);
    console.log(`  • ${serviceCount} asignaciones de servicios a unidades`);
    console.log(`  • ${monthlyServices.length} registros de consumo mensual`);
    
    console.log(`\n🔔 ALERTAS Y MANTENIMIENTO:`);
    console.log(`  • ${alerts.length} alertas de PRUEBA (en producción se generan automáticamente)`);
    console.log(`  • ${maintenanceRequests.length} solicitudes de mantenimiento`);
    console.log(`  ⚠️  IMPORTANTE: Las alertas se crean AUTOMÁTICAMENTE por el sistema en producción`);
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ DATOS COMPLETOS EN TODAS LAS TABLAS:");
    console.log("=".repeat(50));
    console.log("  ✓ unit_types - Completo");
    console.log("  ✓ service_types - Completo");
    console.log("  ✓ expense_categories - Completo");
    console.log("  ✓ payment_statuses - Completo");
    console.log("  ✓ alert_types - Completo");
    console.log("  ✓ users - Completo");
    console.log("  ✓ buildings - Completo");
    console.log("  ✓ building_unit_type_config - Completo");
    console.log("  ✓ units - Completo");
    console.log("  ✓ unit_services - Completo");
    console.log("  ✓ tenants - Completo");
    console.log("  ✓ contracts - Completo");
    console.log("  ✓ payments - Completo");
    console.log("  ✓ payment_transactions - Completo");
    console.log("  ✓ expenses - Completo");
    console.log("  ✓ monthly_services - Completo");
    console.log("  ✓ alerts - Completo");
    console.log("  ✓ system_settings - Completo");
    console.log("  ✓ maintenance_requests - Completo");
    console.log("  ℹ audit_logs - Se llena automáticamente con uso del sistema");
    
    console.log("\n✅ IMPORTANTE: Todas las unidades están correctamente asignadas a sus edificios");
    console.log("✅ Todos los edificios tienen país asignado (Colombia)");
    console.log("✅ La base de datos está COMPLETAMENTE lista para pruebas!");
    console.log("\n⚙️  SISTEMA DE ALERTAS AUTOMÁTICAS:");
    console.log("  Las alertas NO se crean manualmente. El sistema las genera automáticamente:");
    console.log("\n  📅 RECORDATORIOS MENSUALES DE PAGO (Cron Job Diario - 6:00 AM):");
    console.log("     • Revisa pagos con vencimiento en próximos 5 días");
    console.log("     • Genera alerta: 'Recordatorio - Pago vence en X días'");
    console.log("     • Envía email/SMS automático al inquilino");
    console.log("     • Priority: medium");
    console.log("\n  ⚠️  PAGOS VENCIDOS (Cron Job Diario - 8:00 AM):");
    console.log("     • Busca pagos con due_date < HOY y status = 'Pendiente'");
    console.log("     • Cambia status a 'Vencido' automáticamente");
    console.log("     • Genera alerta: 'Pago Vencido - Acción Requerida'");
    console.log("     • Notifica al administrador");
    console.log("     • Priority: high");
    console.log("\n  📝 CONTRATOS POR VENCER (Cron Job Semanal - Lunes 9:00 AM):");
    console.log("     • Busca contratos con end_date en próximos 60 días");
    console.log("     • Genera alerta: 'Contrato por Vencer - Programar Renovación'");
    console.log("     • Priority: medium");
    console.log("\n  🔧 MANTENIMIENTO (Trigger al crear solicitud):");
    console.log("     • Al INSERT en maintenance_requests");
    console.log("     • Genera alerta según prioridad de la solicitud");
    console.log("     • Notifica a equipo de mantenimiento");
    console.log("\n  🏠 UNIDAD DESOCUPADA (Trigger al finalizar contrato):");
    console.log("     • Al cambiar contract.status a 'completed'");
    console.log("     • Cambia unit.occupation_status a 'vacant'");
    console.log("     • Genera alerta: 'Unidad Disponible'");
    console.log("\n📝 Usuarios de prueba:");
    console.log("  • agomez.desarrollo@andrespublicidadtg.com / admin123 (Administrador)");
    console.log("  • manager@apartamentos.com / manager123 (Gerente)");
    console.log("  • contador@apartamentos.com / user123 (Contador)");
    console.log("  • mantenimiento@apartamentos.com / user123 (Técnico)");
    console.log("  • recepcion@apartamentos.com / user123 (Recepcionista)");
    console.log("  • supervisor@apartamentos.com / user123 (Supervisor)");
    console.log(
      "\n💡 Nota: Los audit_logs se llenarán automáticamente al usar las APIs"
    );
    console.log("\n🎉 BASE DE DATOS CON DATOS COMPLETOS Y REALISTAS! 🎉\n");
  } catch (error: any) {
    console.error("\n❌ Error durante el seed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Ejecutar seed
seed();
