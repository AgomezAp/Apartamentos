/**
 * 📧 Script de Prueba para NotificationService
 * 
 * Este script permite probar todas las notificaciones por email
 * sin necesidad de ejecutar las operaciones reales.
 * 
 * Uso:
 *   npm run test:notifications
 * 
 * Asegúrate de tener configuradas las variables de entorno:
 *   - EMAIL_USER
 *   - EMAIL_PASS
 *   - ADMIN_EMAIL
 *   - FRONTEND_URL
 */

import NotificationService from './services/NotificationService';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de prueba
const TEST_CONFIG = {
  tenantEmail: process.env.TEST_TENANT_EMAIL || 'inquilino.prueba@ejemplo.com',
  adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
  tenantName: 'Juan Pérez González',
  unitNumber: '302',
  buildingName: 'Edificio Los Rosales',
  buildingAddress: 'Calle 45 #12-34, Bogotá',
  amount: 1500000,
  monthlyRent: 1500000,
  depositAmount: 1500000,
};

/**
 * Menú interactivo
 */
async function showMenu() {
  console.log('\n📧 ===== PRUEBA DE NOTIFICACIONES =====\n');
  console.log('Selecciona la notificación a probar:\n');
  console.log('1. 💰 Confirmación de Pago Registrado');
  console.log('2. 📎 Comprobante de Pago Subido');
  console.log('3. ⏰ Recordatorio de Pago (3 días antes)');
  console.log('4. 👋 Bienvenida al Nuevo Contrato');
  console.log('5. 👋 Finalización de Contrato');
  console.log('6. 📊 Resumen Mensual para Administrador');
  console.log('7. ✅ Probar TODAS las notificaciones');
  console.log('8. 🔌 Verificar conexión SMTP');
  console.log('0. ❌ Salir\n');
}

/**
 * 1. Confirmación de Pago
 */
async function test1_PaymentConfirmation() {
  console.log('\n🧪 Probando: Confirmación de Pago Registrado...');
  
  try {
    await NotificationService.notifyPaymentRegistered({
      tenantEmail: TEST_CONFIG.tenantEmail,
      tenantName: TEST_CONFIG.tenantName,
      amount: TEST_CONFIG.amount,
      paymentDate: new Date().toISOString(),
      paymentMethod: 'Transferencia Bancaria',
      periodMonth: 1,
      periodYear: 2025,
      unitNumber: TEST_CONFIG.unitNumber,
      buildingName: TEST_CONFIG.buildingName,
      referenceNumber: 'PAY-2025-001',
    });
    
    console.log('✅ Email enviado correctamente a:', TEST_CONFIG.tenantEmail);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * 2. Comprobante Subido
 */
async function test2_ProofUploaded() {
  console.log('\n🧪 Probando: Notificación de Comprobante Subido...');
  
  try {
    await NotificationService.notifyPaymentProofUploaded({
      adminEmail: TEST_CONFIG.adminEmail!,
      tenantName: TEST_CONFIG.tenantName,
      unitNumber: TEST_CONFIG.unitNumber,
      buildingName: TEST_CONFIG.buildingName,
      amount: TEST_CONFIG.amount,
      periodMonth: 1,
      periodYear: 2025,
      uploadDate: new Date().toISOString(),
      fileName: 'comprobante_enero_2025.pdf',
    });
    
    console.log('✅ Email enviado correctamente a:', TEST_CONFIG.adminEmail);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * 3. Recordatorio de Pago
 */
async function test3_PaymentReminder() {
  console.log('\n🧪 Probando: Recordatorio de Pago...');
  
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3); // 3 días desde hoy
  
  try {
    await NotificationService.sendPaymentReminder({
      tenantEmail: TEST_CONFIG.tenantEmail,
      tenantName: TEST_CONFIG.tenantName,
      amount: TEST_CONFIG.amount,
      dueDate: dueDate.toISOString(),
      periodMonth: 2,
      periodYear: 2025,
      unitNumber: TEST_CONFIG.unitNumber,
      buildingName: TEST_CONFIG.buildingName,
      daysUntilDue: 3,
    });
    
    console.log('✅ Email enviado correctamente a:', TEST_CONFIG.tenantEmail);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * 4. Bienvenida Contrato
 */
async function test4_ContractWelcome() {
  console.log('\n🧪 Probando: Email de Bienvenida al Contrato...');
  
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1); // 1 año después
  
  try {
    await NotificationService.sendContractWelcome({
      tenantEmail: TEST_CONFIG.tenantEmail,
      tenantName: TEST_CONFIG.tenantName,
      unitNumber: TEST_CONFIG.unitNumber,
      buildingName: TEST_CONFIG.buildingName,
      buildingAddress: TEST_CONFIG.buildingAddress,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      monthlyRent: TEST_CONFIG.monthlyRent,
      paymentDay: 5,
      depositAmount: TEST_CONFIG.depositAmount,
    });
    
    console.log('✅ Email enviado correctamente a:', TEST_CONFIG.tenantEmail);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * 5. Finalización Contrato
 */
async function test5_ContractFinished() {
  console.log('\n🧪 Probando: Email de Finalización de Contrato...');
  
  try {
    // Caso 1: Sin saldo pendiente
    await NotificationService.sendContractFinished({
      tenantEmail: TEST_CONFIG.tenantEmail,
      tenantName: TEST_CONFIG.tenantName,
      unitNumber: TEST_CONFIG.unitNumber,
      buildingName: TEST_CONFIG.buildingName,
      endDate: new Date().toISOString(),
      depositAmount: TEST_CONFIG.depositAmount,
      hasOutstandingBalance: false,
      outstandingBalance: 0,
    });
    
    console.log('✅ Email (sin deuda) enviado a:', TEST_CONFIG.tenantEmail);
    
    // Esperar 2 segundos antes del siguiente
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Caso 2: Con saldo pendiente
    await NotificationService.sendContractFinished({
      tenantEmail: TEST_CONFIG.tenantEmail,
      tenantName: TEST_CONFIG.tenantName,
      unitNumber: TEST_CONFIG.unitNumber,
      buildingName: TEST_CONFIG.buildingName,
      endDate: new Date().toISOString(),
      depositAmount: TEST_CONFIG.depositAmount,
      hasOutstandingBalance: true,
      outstandingBalance: 500000,
    });
    
    console.log('✅ Email (con deuda) enviado a:', TEST_CONFIG.tenantEmail);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * 6. Resumen Mensual
 */
async function test6_MonthlyReport() {
  console.log('\n🧪 Probando: Resumen Mensual de Pagos...');
  
  try {
    await NotificationService.sendMonthlyPaymentSummary({
      adminEmail: TEST_CONFIG.adminEmail!,
      month: 1,
      year: 2025,
      totalExpected: 15000000,
      totalReceived: 13500000,
      totalPending: 1000000,
      totalOverdue: 500000,
      collectionRate: 90,
      paymentsByBuilding: [
        {
          buildingName: 'Edificio Los Rosales',
          expected: 7500000,
          received: 7000000,
          pending: 500000,
        },
        {
          buildingName: 'Edificio Las Palmas',
          expected: 7500000,
          received: 6500000,
          pending: 1000000,
        },
      ],
      overduePayments: [
        {
          tenantName: 'María López',
          unitNumber: '101',
          buildingName: 'Edificio Los Rosales',
          amount: 300000,
          daysOverdue: 15,
        },
        {
          tenantName: 'Carlos Ramírez',
          unitNumber: '205',
          buildingName: 'Edificio Las Palmas',
          amount: 200000,
          daysOverdue: 8,
        },
      ],
    });
    
    console.log('✅ Email enviado correctamente a:', TEST_CONFIG.adminEmail);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * 7. Probar todas
 */
async function testAll() {
  console.log('\n🧪 Probando TODAS las notificaciones...\n');
  console.log('⏳ Esto tomará aproximadamente 30 segundos...\n');
  
  await test1_PaymentConfirmation();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await test2_ProofUploaded();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await test3_PaymentReminder();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await test4_ContractWelcome();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await test5_ContractFinished();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await test6_MonthlyReport();
  
  console.log('\n✅ Todas las pruebas completadas!');
}

/**
 * 8. Verificar conexión
 */
async function testConnection() {
  console.log('\n🧪 Verificando conexión SMTP...');
  
  try {
    await NotificationService.verifyConnection();
    console.log('✅ Conexión SMTP exitosa');
  } catch (error: any) {
    console.error('❌ Error de conexión:', error.message);
  }
}

/**
 * Main
 */
async function main() {
  // Verificar configuración
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('\n❌ ERROR: Variables de entorno no configuradas');
    console.log('\nAsegúrate de tener en tu .env:');
    console.log('  EMAIL_USER=tu-correo@gmail.com');
    console.log('  EMAIL_PASS=tu-contraseña-app');
    console.log('  ADMIN_EMAIL=admin@ejemplo.com');
    console.log('  FRONTEND_URL=http://localhost:3000\n');
    process.exit(1);
  }
  
  console.log('\n📧 Configuración actual:');
  console.log('  Email servidor:', process.env.EMAIL_USER);
  console.log('  Email admin:', TEST_CONFIG.adminEmail);
  console.log('  Email inquilino prueba:', TEST_CONFIG.tenantEmail);
  console.log('  Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:3000');
  
  // Importar readline para entrada interactiva
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askQuestion = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
  };
  
  let exit = false;
  
  while (!exit) {
    await showMenu();
    const answer = await askQuestion('Selecciona una opción (0-8): ');
    
    switch (answer.trim()) {
      case '1':
        await test1_PaymentConfirmation();
        break;
      case '2':
        await test2_ProofUploaded();
        break;
      case '3':
        await test3_PaymentReminder();
        break;
      case '4':
        await test4_ContractWelcome();
        break;
      case '5':
        await test5_ContractFinished();
        break;
      case '6':
        await test6_MonthlyReport();
        break;
      case '7':
        await testAll();
        break;
      case '8':
        await testConnection();
        break;
      case '0':
        console.log('\n👋 ¡Hasta luego!\n');
        exit = true;
        break;
      default:
        console.log('\n⚠️  Opción no válida. Intenta de nuevo.');
    }
  }
  
  rl.close();
  process.exit(0);
}

// Ejecutar
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
}
