# 📧 Sistema de Notificaciones por Email

## ✅ Estado: COMPLETAMENTE IMPLEMENTADO

El sistema de notificaciones por email está 100% funcional con 6 tipos de notificaciones automatizadas.

---

## 🏗️ Arquitectura

```
NotificationService.ts (736 líneas)
├── Plantillas HTML profesionales
├── 6 métodos de notificación
├── Helpers (formatMoney, getMonthName)
└── Verificación SMTP

Integraciones:
├── PaymentController.ts → Confirmación de pago
├── UploadController.ts → Comprobante subido
├── ContractController.ts → Bienvenida y despedida
└── alertService.ts → Recordatorios y resumen mensual
```

---

## 📬 Tipos de Notificaciones

### 1. 💰 Confirmación de Pago Registrado

**Trigger**: Después de registrar un pago exitosamente  
**Archivo**: `PaymentController.ts` línea ~105-120  
**Destinatario**: Inquilino (tenant_email)  
**Contenido**: 
- ✅ Caja verde de éxito
- 📋 Tabla con detalles del pago
- 💵 Monto, método, período, referencia

**Ejemplo de Datos**:
```typescript
{
  tenantEmail: 'juan.perez@gmail.com',
  tenantName: 'Juan Pérez',
  amount: 1500000,
  paymentDate: '2025-01-15T10:30:00Z',
  paymentMethod: 'Transferencia Bancaria',
  periodMonth: 1,
  periodYear: 2025,
  unitNumber: '302',
  buildingName: 'Edificio Los Rosales',
  referenceNumber: 'PAY-2025-001'
}
```

---

### 2. 📎 Comprobante de Pago Subido

**Trigger**: Cuando un inquilino sube un comprobante  
**Archivo**: `UploadController.ts` línea ~35-60  
**Destinatario**: Administrador (ADMIN_EMAIL)  
**Contenido**:
- ℹ️ Caja azul informativa
- 📋 Datos del inquilino y pago
- 🔗 Botón "Ver Comprobante"
- ⚠️ Acción requerida: validar comprobante

**Ejemplo de Datos**:
```typescript
{
  adminEmail: 'admin@apartamentos.com',
  tenantName: 'María López',
  unitNumber: '101',
  buildingName: 'Edificio Las Palmas',
  amount: 1200000,
  periodMonth: 1,
  periodYear: 2025,
  uploadDate: '2025-01-15T14:45:00Z',
  fileName: 'comprobante_enero.pdf'
}
```

---

### 3. ⏰ Recordatorio de Pago (3 días antes)

**Trigger**: Cron job diario a las 9:00 AM  
**Archivo**: `alertService.ts` línea ~200-245  
**Destinatario**: Inquilinos con pagos próximos a vencer  
**Lógica**: Query de pagos donde `due_date = CURRENT_DATE + 3 days`  
**Configuración**: Días configurables en settings `notify_payment_due_days`

**Contenido**:
- ⚠️ Caja amarilla de advertencia
- ⏱️ Días faltantes destacados
- 💳 Métodos de pago disponibles
- 🔗 Enlace para pagar

**Ejemplo de Datos**:
```typescript
{
  tenantEmail: 'carlos.gomez@hotmail.com',
  tenantName: 'Carlos Gómez',
  amount: 1800000,
  dueDate: '2025-01-20T00:00:00Z',
  periodMonth: 1,
  periodYear: 2025,
  unitNumber: '405',
  buildingName: 'Edificio Central',
  daysUntilDue: 3
}
```

**Cron Schedule**:
```typescript
cron.schedule('0 9 * * *', async () => {
  await this.sendPaymentReminders();
});
```

---

### 4. 👋 Bienvenida al Nuevo Contrato

**Trigger**: Al crear un contrato con status='active'  
**Archivo**: `ContractController.ts` línea ~105-135  
**Destinatario**: Inquilino nuevo  
**Contenido**:
- 👋 Mensaje de bienvenida
- 📋 Tabla con datos del contrato
- 📅 Fechas, renta mensual, día de pago
- ℹ️ Información importante

**Ejemplo de Datos**:
```typescript
{
  tenantEmail: 'ana.martinez@yahoo.com',
  tenantName: 'Ana Martínez',
  unitNumber: '203',
  buildingName: 'Edificio Los Pinos',
  buildingAddress: 'Carrera 15 #45-67, Bogotá',
  startDate: '2025-02-01T00:00:00Z',
  endDate: '2026-02-01T00:00:00Z',
  monthlyRent: 1600000,
  paymentDay: 5,
  depositAmount: 1600000
}
```

---

### 5. 👋 Finalización de Contrato

**Trigger**: Al finalizar un contrato  
**Archivo**: `ContractController.ts` línea ~150-180  
**Destinatario**: Inquilino saliente  
**Lógica**: Calcula saldo pendiente consultando pagos vencidos  
**Contenido**:
- 👋 Mensaje de despedida
- 💰 Información del depósito
- ⚠️ Alerta condicional si hay saldo pendiente
- 📋 Próximos pasos

**Ejemplo de Datos**:
```typescript
{
  tenantEmail: 'pedro.lopez@gmail.com',
  tenantName: 'Pedro López',
  unitNumber: '501',
  buildingName: 'Torre del Sol',
  endDate: '2025-01-31T23:59:59Z',
  depositAmount: 1400000,
  outstandingBalance: 0  // o monto si hay deuda
}
```

---

### 6. 📊 Resumen Mensual para Administrador

**Trigger**: Cron job el día 1 de cada mes a las 8:00 AM  
**Archivo**: `alertService.ts` línea ~247-335  
**Destinatario**: Administrador (ADMIN_EMAIL)  
**Lógica**: Agrega todos los pagos del mes anterior

**Contenido**:
- 📊 Estadísticas generales
  - Total esperado
  - Total recibido
  - Total pendiente
  - Total vencido
- 🎯 Tasa de cobro con color
  - Verde: >90%
  - Amarillo: 70-90%
  - Rojo: <70%
- 🏢 Tabla por edificio
- 🚨 Top 10 pagos vencidos

**Ejemplo de Datos**:
```typescript
{
  adminEmail: 'admin@apartamentos.com',
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
      pending: 500000
    },
    // ... más edificios
  ],
  overduePayments: [
    {
      tenantName: 'María López',
      unitNumber: '101',
      buildingName: 'Edificio Los Rosales',
      amount: 300000,
      daysOverdue: 15
    },
    // ... más morosos
  ]
}
```

**Cron Schedule**:
```typescript
cron.schedule('0 8 1 * *', async () => {
  await this.sendMonthlyReport();
});
```

---

## ⚙️ Configuración

### Variables de Entorno Requeridas

```bash
# SMTP Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASS=tu-contraseña-app      # App Password de Gmail
EMAIL_FROM_NAME=Sistema de Apartamentos

# Destinatarios
ADMIN_EMAIL=admin@apartamentos.com

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Obtener App Password de Gmail

1. Ir a https://myaccount.google.com/security
2. Activar "Verificación en 2 pasos"
3. Ir a "Contraseñas de aplicaciones"
4. Generar nueva contraseña para "Correo"
5. Copiar la contraseña de 16 dígitos
6. Usar en `EMAIL_PASS`

---

## 🎨 Diseño de Emails

### Características del Template HTML

1. **Responsive**: Se adapta a móviles y escritorio
2. **Profesional**: Encabezado corporativo con degradado morado
3. **Código de Colores**:
   - 🟢 Verde (#d4edda): Éxito (pago confirmado)
   - 🟡 Amarillo (#fff3cd): Advertencia (recordatorio)
   - 🔵 Azul (#d1ecf1): Información (comprobante subido)
4. **Tablas**: Formato moderno con bordes y colores alternos
5. **Botones CTA**: Enlaces destacados para acciones
6. **Footer**: Información de contacto y enlace de cancelación

### Estructura Base

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    /* Estilos responsive */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <!-- Degradado morado corporativo -->
    </div>
    
    <div class="content">
      {content}
    </div>
    
    <div class="footer">
      <!-- Información de contacto -->
    </div>
  </div>
</body>
</html>
```

---

## 🧪 Pruebas

### Script de Prueba Interactivo

```bash
npm run test:notifications
```

Este comando ejecuta `src/testNotifications.ts` que permite:

1. Probar cada notificación individualmente
2. Ver el resultado de cada envío
3. Probar todas las notificaciones a la vez
4. Verificar la conexión SMTP

### Ejemplo de Uso

```bash
$ npm run test:notifications

📧 ===== PRUEBA DE NOTIFICACIONES =====

Selecciona la notificación a probar:

1. 💰 Confirmación de Pago Registrado
2. 📎 Comprobante de Pago Subido
3. ⏰ Recordatorio de Pago (3 días antes)
4. 👋 Bienvenida al Nuevo Contrato
5. 👋 Finalización de Contrato
6. 📊 Resumen Mensual para Administrador
7. ✅ Probar TODAS las notificaciones
8. 🔌 Verificar conexión SMTP
0. ❌ Salir

Selecciona una opción (0-8): 1

🧪 Probando: Confirmación de Pago Registrado...
✅ Email enviado correctamente a: inquilino.prueba@ejemplo.com
```

---

## 📋 Cron Jobs Programados

### En `alertService.ts`:

```typescript
class AlertService {
  start(): void {
    // Contratos por vencer - Diario 8:00 AM
    cron.schedule('0 8 * * *', async () => {
      await this.checkExpiringContracts();
    });

    // Pagos vencidos - Cada hora
    cron.schedule('0 * * * *', async () => {
      await this.checkOverduePayments();
    });

    // 🔔 Recordatorios de pago - Diario 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      await this.sendPaymentReminders();
    });

    // 📊 Resumen mensual - Día 1 a las 8:00 AM
    cron.schedule('0 8 1 * *', async () => {
      await this.sendMonthlyReport();
    });
  }
}
```

---

## 🔧 Troubleshooting

### Email no se envía

1. **Verificar variables de entorno**:
   ```bash
   node -e "console.log(process.env.EMAIL_USER)"
   ```

2. **Verificar conexión SMTP**:
   ```bash
   npm run test:notifications
   # Opción 8: Verificar conexión SMTP
   ```

3. **Revisar App Password de Gmail**:
   - Debe ser de 16 dígitos
   - Sin espacios
   - Verificación en 2 pasos debe estar activa

4. **Revisar logs**:
   ```bash
   # En consola del servidor
   tail -f logs/error.log
   ```

### Emails van a spam

1. Configurar SPF record en DNS
2. Configurar DKIM
3. Usar dominio propio en lugar de Gmail
4. Evitar palabras spam en asuntos
5. Incluir enlace de cancelación de suscripción

### Cron jobs no se ejecutan

1. **Verificar que el servidor esté corriendo**:
   ```bash
   pm2 status
   ```

2. **Verificar logs de cron**:
   ```typescript
   console.log('🔔 Ejecutando cron job...');
   ```

3. **Probar manualmente**:
   ```typescript
   import alertService from './services/alertService';
   await alertService.sendPaymentReminders();
   ```

---

## 📊 Métricas y Logs

### Logs de Email

Cada envío genera un log:

```
✅ Email enviado a: juan.perez@gmail.com
   Tipo: Confirmación de pago
   ID de mensaje: <abc123@gmail.com>
```

### Logs de Cron

```
🔔 Enviando recordatorios de pago...
✅ Enviados 15 recordatorios de pago

📊 Generando resumen mensual...
✅ Resumen mensual enviado a admin@apartamentos.com
```

### Errores

```
❌ Error enviando email a juan.perez@gmail.com:
   Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

---

## 🚀 Mejoras Futuras

### Prioridad Alta:
- [ ] Queue system (Bull/Bee-Queue) para emails masivos
- [ ] Reintentos automáticos en caso de fallo
- [ ] Templates personalizables por edificio
- [ ] Soporte para archivos adjuntos

### Prioridad Media:
- [ ] Historial de emails enviados en BD
- [ ] Estadísticas de apertura/click (tracking)
- [ ] Modo test para ver preview sin enviar
- [ ] Múltiples idiomas (i18n)

### Prioridad Baja:
- [ ] SMS además de email
- [ ] Push notifications
- [ ] Plantillas con Handlebars/Pug
- [ ] Servicio de email transaccional (SendGrid/Mailgun)

---

## 📖 Referencias

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Node-Cron Documentation](https://www.npmjs.com/package/node-cron)
- [HTML Email Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding/)

---

**Última actualización**: 27/12/2025  
**Estado**: ✅ 100% IMPLEMENTADO  
**Autor**: GitHub Copilot
