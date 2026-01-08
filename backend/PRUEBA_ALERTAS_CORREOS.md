# 📧 Guía de Prueba: Sistema de Alertas y Correos

Esta guía te muestra cómo probar el sistema de alertas automáticas y envío de correos.

## 📋 Tabla de Contenidos
1. [Configuración Inicial](#configuración-inicial)
2. [Scripts de Prueba](#scripts-de-prueba)
3. [Ver Correos](#ver-correos)
4. [Verificar Alertas](#verificar-alertas)

---

## 🔧 Configuración Inicial

### 1. Configurar Variables de Entorno

Crea o edita el archivo `.env` en `backend/`:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apartamentos_db
DB_USER=postgres
DB_PASSWORD=tu_password

# Configuración de Email
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
EMAIL_SERVICE=gmail
```

### 2. Obtener Contraseña de Aplicación de Gmail

Si usas Gmail:

1. Ve a https://myaccount.google.com/apppasswords
2. Selecciona "Correo" y "Otro (nombre personalizado)"
3. Escribe: "Apartamentos Sistema"
4. Copia la contraseña generada (16 caracteres)
5. Pégala en `EMAIL_PASS` en tu archivo `.env`

⚠️ **IMPORTANTE**: No uses tu contraseña normal de Gmail, usa una contraseña de aplicación.

### 3. Preparar Base de Datos

Ejecuta el seed para crear datos de prueba:

```bash
cd backend
npx ts-node src/scripts/seed.ts
```

---

## 🧪 Scripts de Prueba

### 📅 Script 1: Recordatorios de Pago

Simula el cron job que envía recordatorios 5 días antes del vencimiento.

**Ejecutar:**
```bash
npx ts-node src/scripts/testPaymentAlerts.ts
```

**Lo que hace:**
- ✅ Busca pagos pendientes que vencen en próximos 5 días
- ✅ Crea alertas en la base de datos (priority: medium)
- ✅ Envía emails a los inquilinos con recordatorio
- ✅ **Envía copia informativa a todos los administradores activos**
- ✅ Muestra el contenido del email en consola

**Salida esperada:**
```
🔔 ===== PRUEBA: RECORDATORIOS DE PAGO =====

📅 Fecha actual: 06/01/2026
🔍 Buscando pagos que vencen en los próximos 5 días...

✅ Encontrados 3 pagos próximos a vencer:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Pago #45
   Inquilino: Carlos Mendoza
   Email: carlos.mendoza@email.com
   Unidad: 301 - Torre Central
   Monto: $1,200,000
   Vence en: 3 días (09/01/2026)
   Periodo: 1/2026
   ✅ Alerta creada: ID 123
   ✉️  Email enviado a: carlos.mendoza@email.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 RESUMEN:
   • Pagos encontrados: 3
   • Alertas creadas: 3
   • Emails enviados: 3

✅ Prueba completada exitosamente!
```

---

### ⚠️ Script 2: Pagos Vencidos

Simula el cron job que marca pagos como vencidos y notifica.

**Ejecutar:**
```bash
npx ts-node src/scripts/testOverduePayments.ts
```

**Lo que hace:**
- ✅ Busca pagos pendientes con fecha ya vencida
- ✅ Cambia el status de "Pendiente" a "Vencido"
- ✅ Crea alertas de alta prioridad (priority: high)
- ✅ Envía emails urgentes a inquilinos
- ✅ **Envía alertas detalladas a todos los administradores activos**
- ✅ Calcula mora automáticamente
- ✅ Registra en audit_logs

**Salida esperada:**
```
⚠️  ===== PRUEBA: PAGOS VENCIDOS =====

📅 Fecha actual: 06/01/2026
🔍 Buscando pagos pendientes con fecha vencida...

⚠️  Encontrados 2 pagos vencidos:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 Pago #23
   Inquilino: Ana Gómez
   Email: ana.gomez@email.com
   Teléfono: 3001234567
   Unidad: 502 - Edificio Los Andes
   Monto: $1,350,000
   Fecha vencimiento: 01/01/2026
   ⚠️  Días vencido: 5 días
   Estado actual: Pendiente
   ✅ Status actualizado a: VENCIDO
   🔔 Alerta creada: ID 124 (Prioridad: ALTA)
   ✉️  Email de notificación enviado
   📝 Registro en audit_logs creado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 RESUMEN DE PROCESAMIENTO:
   • Pagos vencidos encontrados: 2
   • Pagos actualizados a "Vencido": 2
   • Alertas de alta prioridad creadas: 2
   • Emails de notificación enviados: 2
   • Registros de auditoría: 2

✅ Procesamiento de pagos vencidos completado!
```

---

## 📧 Ver Correos

### Opción 1: Si configuraste EMAIL (Recomendado)

Los correos se enviarán realmente. Revisa tu bandeja de entrada del email configurado en `EMAIL_USER`.

**Ejemplo de correo recibido:**

```
De: tu-email@gmail.com
Para: inquilino@email.com
Asunto: Recordatorio de Pago - Torre Central Unidad 301

Hola Carlos Mendoza,

Este es un recordatorio de que tu pago está próximo a vencer.

📋 DETALLES DEL PAGO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Edificio: Torre Central
  • Unidad: 301
  • Periodo: 1/2026
  • Monto: $1,200,000 COP
  • Fecha de vencimiento: 09/01/2026
  • Días restantes: 3 días
...
```

### Opción 2: Sin configurar EMAIL

Si no configuras las variables de email, los scripts **igual funcionan** pero:
- ✅ Las alertas SÍ se crean en la base de datos
- ✅ El contenido del email se muestra en consola
- ❌ No se envían emails reales

**Ejemplo de salida:**
```
⚠️  Email NO enviado (configurar EMAIL_USER y EMAIL_PASS en .env)
📧 Email que se enviaría:

┌─────────────────────────────────────────────
│ Para: carlos.mendoza@email.com
│ Asunto: Recordatorio de Pago - Torre Central Unidad 301
│ ─────────────────────────────────────────────
│ 
│ Hola Carlos Mendoza,
│ 
│ Este es un recordatorio de que tu pago está próximo a vencer.
│ ...
└─────────────────────────────────────────────
```

---

## 🔍 Verificar Alertas en Base de Datos

### Ver alertas creadas:

```sql
-- Ver todas las alertas
SELECT 
  a.id,
  at.name as tipo,
  a.title as titulo,
  a.priority as prioridad,
  a.is_read as leida,
  a.created_at as fecha_creacion,
  b.name as edificio,
  u.unit_number as unidad
FROM alerts a
INNER JOIN alert_types at ON a.alert_type_id = at.id
LEFT JOIN buildings b ON a.building_id = b.id
LEFT JOIN units u ON a.unit_id = u.id
ORDER BY a.created_at DESC
LIMIT 20;
```

### Ver pagos vencidos:

```sql
SELECT 
  p.id,
  p.period_month,
  p.period_year,
  p.amount_due,
  p.due_date,
  ps.name as estado,
  t.full_name as inquilino,
  u.unit_number as unidad,
  b.name as edificio
FROM payments p
INNER JOIN payment_statuses ps ON p.payment_status_id = ps.id
INNER JOIN contracts c ON p.contract_id = c.id
INNER JOIN tenants t ON c.tenant_id = t.id
INNER JOIN units u ON c.unit_id = u.id
INNER JOIN buildings b ON u.building_id = b.id
WHERE ps.name = 'Vencido'
ORDER BY p.due_date DESC;
```

### Ver audit logs:

```sql
SELECT 
  id,
  action,
  entity_type,
  entity_id,
  description,
  created_at
FROM audit_logs
WHERE entity_type = 'Payment'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎯 Flujo Completo de Prueba

### Paso a paso:

1. **Preparar datos:**
   ```bash
   npx ts-node src/scripts/seed.ts
   ```

2. **Probar recordatorios:**
   ```bash
   npx ts-node src/scripts/testPaymentAlerts.ts
   ```

3. **Probar pagos vencidos:**
   ```bash
   npx ts-node src/scripts/testOverduePayments.ts
   ```

4. **Ver resultados en BD:**
   ```sql
   SELECT COUNT(*) FROM alerts; -- Ver total de alertas creadas
   SELECT * FROM alerts ORDER BY created_at DESC LIMIT 5;
   ```

5. **Revisar emails** (si configuraste EMAIL_USER/PASSWORD)

---

## 🔄 Automatización Real (Cron Jobs)

Para implementar los cron jobs reales en producción:

### 1. Instalar dependencia:
```bash
npm install node-cron
npm install @types/node-cron --save-dev
```

### 2. Crear archivo de jobs:

**`backend/src/jobs/index.ts`**:
```typescript
import cron from 'node-cron';
import { exec } from 'child_process';

console.log('🔄 Iniciando sistema de Cron Jobs...');

// Recordatorios de pago - Diario 6:00 AM
cron.schedule('0 6 * * *', () => {
  console.log('🔔 Ejecutando: Recordatorios de Pago');
  exec('npx ts-node src/scripts/testPaymentAlerts.ts');
});

// Pagos vencidos - Diario 8:00 AM
cron.schedule('0 8 * * *', () => {
  console.log('⚠️ Ejecutando: Procesamiento de Pagos Vencidos');
  exec('npx ts-node src/scripts/testOverduePayments.ts');
});

console.log('✅ Cron Jobs configurados:');
console.log('   • Recordatorios: Diario 6:00 AM');
console.log('   • Pagos Vencidos: Diario 8:00 AM');
```

### 3. Iniciar en index.ts:
```typescript
import './jobs'; // Agregar esta línea
```

---

## ❓ Preguntas Frecuentes

### ¿Por qué no recibo emails?

1. Verifica que `EMAIL_USER` y `EMAIL_PASS` estén en `.env`
2. Usa contraseña de aplicación, no tu contraseña normal
3. Revisa la carpeta de spam
4. Verifica que el email del inquilino sea válido

### ¿Cómo sé si las alertas se crearon?

Consulta la tabla `alerts`:
```sql
SELECT COUNT(*) FROM alerts;
```

### ¿Puedo cambiar el contenido del email?

Sí, edita los scripts:
- `testPaymentAlerts.ts` - Para recordatorios
- `testOverduePayments.ts` - Para pagos vencidos

### ¿Los scripts modifican la base de datos?

- `testPaymentAlerts.ts`: Solo crea alertas, NO modifica pagos
- `testOverduePayments.ts`: SÍ modifica - cambia status de pagos a "Vencido"

---

## 📊 Resumen

| Script | Modifica BD | Envía Emails | Frecuencia Recomendada |
|--------|-------------|--------------|------------------------|
| testPaymentAlerts.ts | ✅ (solo alertas) | ✅ | Diario 6:00 AM |
| testOverduePayments.ts | ✅ (status + alertas) | ✅ | Diario 8:00 AM |

---

## 🎉 ¡Listo!

Ahora puedes probar el sistema completo de alertas y correos electrónicos.

¿Necesitas ayuda? Revisa los logs en consola o consulta la documentación completa en `SISTEMA_ALERTAS_AUTOMATICAS.md`.
