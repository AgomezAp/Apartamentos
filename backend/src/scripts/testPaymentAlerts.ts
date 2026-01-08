/**
 * Script de Prueba: Recordatorios de Pago
 * 
 * Este script simula el Cron Job que envía recordatorios de pago
 * a los inquilinos 5 días antes del vencimiento.
 * 
 * Ejecutar: npx ts-node src/scripts/testPaymentAlerts.ts
 */

import pool from '../config/database';
import { sendMail } from '../config/email';

interface PaymentReminder {
  payment_id: number;
  contract_id: number;
  tenant_name: string;
  tenant_email: string;
  unit_number: string;
  building_name: string;
  building_id: number;
  unit_id: number;
  amount_due: number;
  due_date: string;
  period_month: number;
  period_year: number;
  days_until_due: number;
}

async function testPaymentReminders() {
  console.log('\n🔔 ===== PRUEBA: RECORDATORIOS DE PAGO =====\n');
  console.log('📅 Fecha actual:', new Date().toLocaleDateString());
  console.log('🔍 Buscando pagos que vencen en los próximos 5 días...\n');

  try {
    // Buscar pagos pendientes que vencen en próximos 5 días
    const query = `
      SELECT 
        p.id as payment_id,
        p.contract_id,
        p.amount_due,
        p.due_date,
        p.period_month,
        p.period_year,
        (p.due_date - CURRENT_DATE) as days_until_due,
        CONCAT(t.first_name, ' ', t.last_name) as tenant_name,
        t.email as tenant_email,
        u.unit_number,
        b.name as building_name,
        u.building_id,
        u.id as unit_id
      FROM payments p
      INNER JOIN contracts c ON p.contract_id = c.id
      INNER JOIN tenants t ON c.tenant_id = t.id
      INNER JOIN units u ON c.unit_id = u.id
      INNER JOIN buildings b ON u.building_id = b.id
      INNER JOIN payment_statuses ps ON p.payment_status_id = ps.id
      WHERE ps.name = 'Pendiente'
        AND p.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '5 days'
      ORDER BY p.due_date ASC
    `;

    const result = await pool.query(query);
    const upcomingPayments: PaymentReminder[] = result.rows;

    if (upcomingPayments.length === 0) {
      console.log('ℹ️  No hay pagos próximos a vencer en los próximos 5 días.');
      console.log('\n💡 Sugerencia: Ejecuta el seed para crear datos de prueba:');
      console.log('   npx ts-node src/scripts/seed.ts');
      return;
    }

    console.log(`✅ Encontrados ${upcomingPayments.length} pagos próximos a vencer:\n`);
    console.log('━'.repeat(80));

    let alertsCreated = 0;
    let emailsSent = 0;

    for (const payment of upcomingPayments) {
      console.log(`\n📋 Pago #${payment.payment_id}`);
      console.log(`   Inquilino: ${payment.tenant_name}`);
      console.log(`   Email: ${payment.tenant_email}`);
      console.log(`   Unidad: ${payment.unit_number} - ${payment.building_name}`);
      console.log(`   Monto: $${payment.amount_due.toLocaleString('es-CO')}`);
      console.log(`   Vence en: ${payment.days_until_due} días (${new Date(payment.due_date).toLocaleDateString()})`);
      console.log(`   Periodo: ${payment.period_month}/${payment.period_year}`);

      // 1. Crear alerta en la base de datos
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
          `Recordatorio de Pago - Vence en ${payment.days_until_due} días`,
          `Hola ${payment.tenant_name}, tu pago de $${payment.amount_due.toLocaleString('es-CO')} correspondiente a ${payment.period_month}/${payment.period_year} vence el ${new Date(payment.due_date).toLocaleDateString()}. Por favor realiza el pago a tiempo para evitar recargos.`,
          'medium',
          payment.building_id,
          payment.unit_id,
          payment.contract_id,
          payment.payment_id
        ]);

        console.log(`   ✅ Alerta creada: ID ${alertResult.rows[0].id}`);
        alertsCreated++;
      }

      // 2. Enviar email al inquilino
      try {
        const emailSubject = `Recordatorio de Pago - ${payment.building_name} Unidad ${payment.unit_number}`;
        const emailBody = `
Hola ${payment.tenant_name},

Este es un recordatorio de que tu pago está próximo a vencer.

📋 DETALLES DEL PAGO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Edificio: ${payment.building_name}
  • Unidad: ${payment.unit_number}
  • Periodo: ${payment.period_month}/${payment.period_year}
  • Monto: $${payment.amount_due.toLocaleString('es-CO')} COP
  • Fecha de vencimiento: ${new Date(payment.due_date).toLocaleDateString()}
  • Días restantes: ${payment.days_until_due} días

⚠️ IMPORTANTE:
Por favor realiza el pago antes de la fecha de vencimiento para evitar recargos por mora.

💳 MÉTODOS DE PAGO:
  • Transferencia bancaria
  • Pago en efectivo en administración
  • PSE

Si ya realizaste el pago, por favor ignora este mensaje.

Gracias,
Administración ${payment.building_name}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Este es un mensaje automático. Por favor no responder.
        `;

        // Email informativo para administradores
        const adminEmailSubject = `📅 Recordatorio Enviado - ${payment.building_name} Unidad ${payment.unit_number}`;
        const adminEmailBody = `
RECORDATORIO DE PAGO ENVIADO AL INQUILINO

Se ha enviado un recordatorio de pago al siguiente inquilino:

👤 INQUILINO:
  • Nombre: ${payment.tenant_name}
  • Email: ${payment.tenant_email}
  • Unidad: ${payment.unit_number} - ${payment.building_name}

💰 DETALLES DEL PAGO:
  • Periodo: ${payment.period_month}/${payment.period_year}
  • Monto: $${payment.amount_due.toLocaleString('es-CO')} COP
  • Vence en: ${payment.days_until_due} días (${new Date(payment.due_date).toLocaleDateString()})

📧 Este es un recordatorio preventivo enviado automáticamente.
El inquilino recibirá el mensaje en: ${payment.tenant_email}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sistema de Gestión Inmobiliaria - Notificación Automática
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

          // 2. Enviar copia informativa a administradores
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
            console.log(`   📧 Copia enviada a ${adminEmailList.length} administrador(es): ${adminEmailList.join(', ')}`);
            emailsSent += adminEmailList.length;
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

      console.log('━'.repeat(80));
    }

    // Resumen final
    console.log('\n📊 RESUMEN:');
    console.log(`   • Pagos encontrados: ${upcomingPayments.length}`);
    console.log(`   • Alertas creadas: ${alertsCreated}`);
    console.log(`   • Emails enviados: ${emailsSent}`);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('\n💡 CONFIGURACIÓN DE EMAIL:');
      console.log('   Para enviar emails reales, agrega en tu archivo .env:');
      console.log('   EMAIL_USER=tu-email@gmail.com');
      console.log('   EMAIL_PASS=tu-contraseña-de-aplicación');
      console.log('   EMAIL_SERVICE=gmail');
      console.log('\n   ⚠️  Para Gmail, usa una contraseña de aplicación:');
      console.log('   https://myaccount.google.com/apppasswords');
    }

    console.log('\n✅ Prueba completada exitosamente!\n');

  } catch (error: any) {
    console.error('\n❌ Error en la prueba:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar
testPaymentReminders().catch(console.error);
