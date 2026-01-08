/**
 * Script de Prueba: Pagos Vencidos
 * 
 * Este script simula el Cron Job que marca pagos como vencidos
 * y envía notificaciones a los inquilinos.
 * 
 * Ejecutar: npx ts-node src/scripts/testOverduePayments.ts
 */

import pool from '../config/database';
import { sendMail } from '../config/email';

async function testOverduePayments() {
  console.log('\n⚠️  ===== PRUEBA: PAGOS VENCIDOS =====\n');
  console.log('📅 Fecha actual:', new Date().toLocaleDateString());
  console.log('🔍 Buscando pagos pendientes con fecha vencida...\n');

  try {
    // Buscar pagos pendientes que ya vencieron
    const overdueQuery = `
      SELECT 
        p.id as payment_id,
        p.contract_id,
        p.amount_due,
        p.due_date,
        p.period_month,
        p.period_year,
        (CURRENT_DATE - p.due_date) as days_overdue,
        CONCAT(t.first_name, ' ', t.last_name) as tenant_name,
        t.email as tenant_email,
        t.phone as tenant_phone,
        u.unit_number,
        u.id as unit_id,
        b.name as building_name,
        b.id as building_id,
        ps.name as current_status
      FROM payments p
      INNER JOIN contracts c ON p.contract_id = c.id
      INNER JOIN tenants t ON c.tenant_id = t.id
      INNER JOIN units u ON c.unit_id = u.id
      INNER JOIN buildings b ON u.building_id = b.id
      INNER JOIN payment_statuses ps ON p.payment_status_id = ps.id
      WHERE ps.name = 'Pendiente'
        AND p.due_date < CURRENT_DATE
      ORDER BY p.due_date ASC
    `;

    const result = await pool.query(overdueQuery);
    const overduePayments = result.rows;

    if (overduePayments.length === 0) {
      console.log('✅ No hay pagos vencidos pendientes de actualizar.');
      console.log('\n💡 Sugerencia: Los pagos están al día o ya fueron marcados como vencidos.');
      return;
    }

    console.log(`⚠️  Encontrados ${overduePayments.length} pagos vencidos:\n`);
    console.log('━'.repeat(80));

    // Obtener ID del status "Vencido"
    const overdueStatusResult = await pool.query(
      "SELECT id FROM payment_statuses WHERE name = 'Vencido' LIMIT 1"
    );

    if (overdueStatusResult.rows.length === 0) {
      console.error('❌ Error: No se encontró el status "Vencido" en la base de datos');
      return;
    }

    const overdueStatusId = overdueStatusResult.rows[0].id;
    let paymentsUpdated = 0;
    let alertsCreated = 0;
    let emailsSent = 0;

    for (const payment of overduePayments) {
      console.log(`\n💳 Pago #${payment.payment_id}`);
      console.log(`   Inquilino: ${payment.tenant_name}`);
      console.log(`   Email: ${payment.tenant_email}`);
      console.log(`   Teléfono: ${payment.tenant_phone || 'No registrado'}`);
      console.log(`   Unidad: ${payment.unit_number} - ${payment.building_name}`);
      console.log(`   Monto: $${payment.amount_due.toLocaleString('es-CO')}`);
      console.log(`   Fecha vencimiento: ${new Date(payment.due_date).toLocaleDateString()}`);
      console.log(`   ⚠️  Días vencido: ${payment.days_overdue} días`);
      console.log(`   Estado actual: ${payment.current_status}`);

      // 1. Actualizar status del pago a "Vencido"
      await pool.query(
        "UPDATE payments SET payment_status_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [overdueStatusId, payment.payment_id]
      );
      console.log(`   ✅ Status actualizado a: VENCIDO`);
      paymentsUpdated++;

      // 2. Crear alerta de alta prioridad
      const alertTypeResult = await pool.query(
        "SELECT id FROM alert_types WHERE name = 'Pago Vencido' LIMIT 1"
      );

      if (alertTypeResult.rows.length > 0) {
        const alertResult = await pool.query(`
          INSERT INTO alerts (
            alert_type_id, title, message, priority, is_read, is_resolved,
            building_id, unit_id, contract_id, payment_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, false, false, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `, [
          alertTypeResult.rows[0].id,
          'Pago Vencido - Acción Requerida',
          `⚠️ URGENTE: El pago de ${payment.tenant_name} (Unidad ${payment.unit_number}) está vencido por ${payment.days_overdue} días. Monto: $${payment.amount_due.toLocaleString('es-CO')}. Se requiere seguimiento inmediato.`,
          'high',
          payment.building_id,
          payment.unit_id,
          payment.contract_id,
          payment.payment_id
        ]);

        console.log(`   🔔 Alerta creada: ID ${alertResult.rows[0].id} (Prioridad: ALTA)`);
        alertsCreated++;
      }

      // 3. Enviar email al inquilino
      try {
        const emailSubject = `⚠️ PAGO VENCIDO - ${payment.building_name} Unidad ${payment.unit_number}`;
        const mora = Math.round(payment.amount_due * 0.05); // 5% de mora ejemplo
        const totalConMora = payment.amount_due + mora;

        const emailBody = `
Estimado/a ${payment.tenant_name},

NOTIFICAMOS QUE SU PAGO SE ENCUENTRA VENCIDO.

⚠️  INFORMACIÓN DEL PAGO VENCIDO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Edificio: ${payment.building_name}
  • Unidad: ${payment.unit_number}
  • Periodo: ${payment.period_month}/${payment.period_year}
  • Monto original: $${payment.amount_due.toLocaleString('es-CO')} COP
  • Fecha de vencimiento: ${new Date(payment.due_date).toLocaleDateString()}
  • Días de mora: ${payment.days_overdue} días
  
💰 MONTO A PAGAR CON MORA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Monto base: $${payment.amount_due.toLocaleString('es-CO')}
  • Interés de mora (${payment.days_overdue} días): $${mora.toLocaleString('es-CO')}
  • TOTAL A PAGAR: $${totalConMora.toLocaleString('es-CO')} COP

🔴 ACCIÓN REQUERIDA URGENTE:
Por favor, regularice su situación lo antes posible para evitar:
  ✗ Incremento de intereses de mora
  ✗ Procesos de cobro jurídico
  ✗ Suspensión de servicios
  ✗ Terminación del contrato

💳 MÉTODOS DE PAGO:
  • Transferencia bancaria (preferido)
  • Pago en efectivo en administración
  • PSE

📞 CONTACTO:
Si tiene alguna dificultad para realizar el pago, por favor comuníquese
con administración de inmediato para evaluar alternativas.

IMPORTANTE: Este es un requerimiento formal de pago.

Atentamente,
Administración ${payment.building_name}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Este es un mensaje automático generado por el sistema.
        `;

        // Email para administradores
        const adminEmailSubject = `🚨 ALERTA: Pago Vencido - ${payment.building_name} Unidad ${payment.unit_number}`;
        const adminEmailBody = `
ALERTA DE PAGO VENCIDO - REQUIERE SEGUIMIENTO

Se ha detectado un pago vencido que requiere su atención inmediata.

👤 INFORMACIÓN DEL INQUILINO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Nombre: ${payment.tenant_name}
  • Email: ${payment.tenant_email}
  • Teléfono: ${payment.tenant_phone || 'No registrado'}
  
🏢 INFORMACIÓN DE LA UNIDAD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Edificio: ${payment.building_name}
  • Unidad: ${payment.unit_number}
  
💰 DETALLES DEL PAGO VENCIDO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Periodo: ${payment.period_month}/${payment.period_year}
  • Monto: $${payment.amount_due.toLocaleString('es-CO')} COP
  • Fecha de vencimiento: ${new Date(payment.due_date).toLocaleDateString()}
  • Días de mora: ${payment.days_overdue} días
  • Interés de mora estimado: $${mora.toLocaleString('es-CO')} COP
  • Total a cobrar: $${totalConMora.toLocaleString('es-CO')} COP

⚠️  ACCIONES REALIZADAS AUTOMÁTICAMENTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Status del pago actualizado a "Vencido"
  ✓ Alerta de alta prioridad generada en el sistema
  ✓ Email de notificación enviado al inquilino
  ✓ Registro en audit log creado

📋 ACCIONES RECOMENDADAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Contactar al inquilino vía telefónica
  2. Verificar si hay acuerdos de pago vigentes
  3. Evaluar inicio de proceso de cobro si corresponde
  4. Revisar historial de pagos del inquilino
  5. Considerar suspensión de servicios según reglamento

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sistema de Gestión Inmobiliaria - Alerta Automática
Este mensaje fue generado automáticamente el ${new Date().toLocaleString()}
        `;

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          // 1. Enviar email al inquilino
          await sendMail(
            [payment.tenant_email],
            emailSubject,
            emailBody
          );
          console.log(`   ✉️  Email enviado al inquilino: ${payment.tenant_email}`);
          emailsSent++;

          // 2. Obtener emails de administradores
          const adminEmails = await pool.query(`
            SELECT email FROM users 
            WHERE is_active = true 
            AND email IS NOT NULL 
            AND email != ''
          `);

          if (adminEmails.rows.length > 0) {
            const adminEmailList = adminEmails.rows.map(admin => admin.email);
            await sendMail(
              adminEmailList,
              adminEmailSubject,
              adminEmailBody
            );
            console.log(`   📧 Email de alerta enviado a ${adminEmailList.length} administrador(es)`);
            console.log(`      → ${adminEmailList.join(', ')}`);
            emailsSent += adminEmailList.length;
          } else {
            console.log(`   ⚠️  No se encontraron administradores activos para notificar`);
          }
        } else {
          console.log(`   ⚠️  Email NO enviado (configurar EMAIL_USER y EMAIL_PASS en .env)`);
          console.log(`   📧 Email que se enviaría:\n`);
          console.log('   ┌─────────────────────────────────────────────');
          console.log(`   │ Para: ${payment.tenant_email}`);
          console.log(`   │ Asunto: ${emailSubject}`);
          console.log('   │ ─────────────────────────────────────────────');
          console.log(emailBody.split('\n').map(line => `   │ ${line}`).join('\n'));
          console.log('   └─────────────────────────────────────────────\n');
        }
      } catch (emailError: any) {
        console.log(`   ❌ Error enviando email: ${emailError.message}`);
      }

      // 4. Registrar en audit log
      await pool.query(`
        INSERT INTO audit_logs (
          user_id, action, table_name, record_id, old_values, new_values, 
          ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      `, [
        1, // Sistema
        'update',
        'payments',
        payment.payment_id,
        JSON.stringify({ status: payment.current_status }),
        JSON.stringify({ status: 'Vencido', note: `Marcado automáticamente - ${payment.days_overdue} días de mora` }),
        '127.0.0.1',
        'System Cron Job - Overdue Payments'
      ]);
      console.log(`   📝 Registro en audit_logs creado`);

      console.log('━'.repeat(80));
    }

    // Resumen final
    console.log('\n📊 RESUMEN DE PROCESAMIENTO:');
    console.log(`   • Pagos vencidos encontrados: ${overduePayments.length}`);
    console.log(`   • Pagos actualizados a "Vencido": ${paymentsUpdated}`);
    console.log(`   • Alertas de alta prioridad creadas: ${alertsCreated}`);
    console.log(`   • Emails de notificación enviados: ${emailsSent}`);
    console.log(`   • Registros de auditoría: ${paymentsUpdated}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('\n💡 CONFIGURACIÓN DE EMAIL:');
      console.log('   Para enviar emails reales, agrega en tu archivo .env:');
      console.log('   EMAIL_USER=tu-email@gmail.com');
      console.log('   EMAIL_PASS=tu-contraseña-de-aplicación');
      console.log('   EMAIL_SERVICE=gmail');
    }

    console.log('\n✅ Procesamiento de pagos vencidos completado!\n');

  } catch (error: any) {
    console.error('\n❌ Error en el procesamiento:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar
testOverduePayments().catch(console.error);
