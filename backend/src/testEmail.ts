import { sendMail } from './config/email';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script de prueba para el envío de correos
 * 
 * Para ejecutar:
 * npx ts-node src/testEmail.ts
 */
async function testEmail() {
  console.log('🔧 Iniciando prueba de envío de correo...\n');
  
  // Verificar configuración
  console.log('📋 Configuración cargada:');
  console.log('   EMAIL_USER:', process.env.EMAIL_USER);
  console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NO CONFIGURADO');
  console.log('   FIXED_RECIPIENTS:', process.env.FIXED_RECIPIENTS);
  console.log('');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ ERROR: Las variables EMAIL_USER y EMAIL_PASS no están configuradas');
    console.error('   Verifica el archivo .env');
    process.exit(1);
  }
  
  try {
    // Destinatarios (puedes cambiarlos)
    const recipients = [process.env.FIXED_RECIPIENTS || 'test@example.com'];
    
    // Asunto del correo
    const subject = 'Prueba de Sistema de Correo';
    
    // Contenido del mensaje
    const text = `
Hola,

Este es un correo de prueba del Sistema de Gestión Inmobiliaria.

El sistema de envío de correos está funcionando correctamente.

Fecha: ${new Date().toLocaleString('es-CO')}

---
Sistema de Gestión Inmobiliaria
Este es un mensaje automático, por favor no responder.
    `;
    
    console.log('📧 Enviando correo a:', recipients);
    console.log('📝 Asunto:', subject);
    console.log('\n⏳ Procesando...\n');
    
    // Enviar el correo
    const result = await sendMail(recipients, subject, text);
    
    console.log('✅ Correo enviado exitosamente!');
    console.log('Message ID:', result.messageId);
    console.log('\n📬 Revisa la bandeja de entrada de:', recipients[0]);
    
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
    process.exit(1);
  }
}

// Ejecutar la prueba
testEmail();
