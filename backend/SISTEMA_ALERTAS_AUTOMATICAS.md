# 🔔 Sistema de Alertas Automáticas

## Descripción General

El sistema de alertas **NO se gestiona manualmente**. Todas las alertas se generan automáticamente mediante **Cron Jobs**, **Triggers de BD** y **Lógica de Negocio** en los servicios.

---

## 📅 1. Recordatorios Mensuales de Pago

### Funcionamiento
- **Ejecución**: Cron Job diario a las **6:00 AM**
- **Consulta**: Busca todos los pagos pendientes con `due_date` en los próximos 5 días

```sql
SELECT p.*, c.*, u.*, t.*
FROM payments p
INNER JOIN contracts c ON p.contract_id = c.id
INNER JOIN units u ON c.unit_id = u.id
INNER JOIN tenants t ON c.tenant_id = t.id
WHERE p.payment_status_id = (SELECT id FROM payment_statuses WHERE name = 'Pendiente')
  AND p.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '5 days'
```

### Acciones Automáticas
1. Genera alerta en tabla `alerts`:
   ```
   Título: "Recordatorio de Pago - Vence en X días"
   Mensaje: "Su pago de $X,XXX,XXX correspondiente al periodo MM/YYYY vence el DD/MM/YYYY"
   Priority: medium
   ```

2. Envía **email** al inquilino (usando servicio de email)
3. Envía **SMS** al inquilino (opcional, si está configurado)
4. Registra en `audit_logs`

### Implementación Requerida
Crear archivo: `backend/src/jobs/paymentReminders.ts`

```typescript
import cron from 'node-cron';
import { executeQuery } from '../config/database';
import { sendEmail } from '../services/emailService';

// Ejecuta todos los días a las 6:00 AM
cron.schedule('0 6 * * *', async () => {
  console.log('🔔 Ejecutando job de recordatorios de pago...');
  
  const upcomingPayments = await executeQuery(`
    SELECT p.*, c.*, u.unit_number, t.full_name, t.email, t.phone,
           b.name as building_name,
           ps.name as payment_status,
           DATE_PART('day', p.due_date - CURRENT_DATE) as days_until_due
    FROM payments p
    INNER JOIN contracts c ON p.contract_id = c.id
    INNER JOIN units u ON c.unit_id = u.id
    INNER JOIN tenants t ON c.tenant_id = t.id
    INNER JOIN buildings b ON u.building_id = b.id
    INNER JOIN payment_statuses ps ON p.payment_status_id = ps.id
    WHERE ps.name = 'Pendiente'
      AND p.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '5 days'
  `);

  for (const payment of upcomingPayments) {
    // Crear alerta
    const alertType = await executeQuery(
      "SELECT id FROM alert_types WHERE name = 'Pago Vencido' LIMIT 1"
    );
    
    await executeQuery(`
      INSERT INTO alerts (
        alert_type_id, title, message, priority, is_read, is_resolved,
        building_id, unit_id, contract_id, payment_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, false, false, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      alertType[0].id,
      `Recordatorio de Pago - Vence en ${payment.days_until_due} días`,
      `Hola ${payment.full_name}, tu pago de $${payment.amount_due.toLocaleString()} correspondiente a ${payment.period_month}/${payment.period_year} vence el ${payment.due_date}. Por favor realiza el pago a tiempo.`,
      'medium',
      payment.building_id,
      payment.id, // unit_id
      payment.contract_id,
      payment.id // payment_id
    ]);

    // Enviar email
    await sendEmail({
      to: payment.email,
      subject: `Recordatorio de Pago - ${payment.building_name} Unidad ${payment.unit_number}`,
      text: `Tu pago vence en ${payment.days_until_due} días. Monto: $${payment.amount_due.toLocaleString()}`
    });
  }

  console.log(`✅ ${upcomingPayments.length} recordatorios enviados`);
});
```

---

## ⚠️ 2. Pagos Vencidos (Cambio Automático de Estado)

### Funcionamiento
- **Ejecución**: Cron Job diario a las **8:00 AM**
- **Consulta**: Busca pagos pendientes donde `due_date < CURRENT_DATE`

```sql
SELECT p.*, c.*, u.*, t.*
FROM payments p
INNER JOIN contracts c ON p.contract_id = c.id
INNER JOIN units u ON c.unit_id = u.id
INNER JOIN tenants t ON c.tenant_id = t.id
WHERE p.payment_status_id = (SELECT id FROM payment_statuses WHERE name = 'Pendiente')
  AND p.due_date < CURRENT_DATE
```

### Acciones Automáticas
1. **Cambia el status del pago** de 'Pendiente' a 'Vencido'
2. Genera alerta de alta prioridad para administrador
3. Envía notificación al inquilino
4. Registra en `audit_logs`

### Implementación
```typescript
cron.schedule('0 8 * * *', async () => {
  console.log('⚠️ Ejecutando job de pagos vencidos...');
  
  const overduePayments = await executeQuery(`
    SELECT p.id, p.contract_id, c.unit_id, u.building_id, t.full_name, t.email
    FROM payments p
    INNER JOIN contracts c ON p.contract_id = c.id
    INNER JOIN units u ON c.unit_id = u.id
    INNER JOIN tenants t ON c.tenant_id = t.id
    WHERE p.payment_status_id = (SELECT id FROM payment_statuses WHERE name = 'Pendiente')
      AND p.due_date < CURRENT_DATE
  `);

  const overdueStatusId = await executeQuery(
    "SELECT id FROM payment_statuses WHERE name = 'Vencido' LIMIT 1"
  );

  for (const payment of overduePayments) {
    // Cambiar status del pago
    await executeQuery(
      "UPDATE payments SET payment_status_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [overdueStatusId[0].id, payment.id]
    );

    // Crear alerta de alta prioridad
    await executeQuery(`
      INSERT INTO alerts (
        alert_type_id, title, message, priority, is_read, is_resolved,
        building_id, unit_id, contract_id, payment_id, created_at, updated_at
      ) VALUES (
        (SELECT id FROM alert_types WHERE name = 'Pago Vencido'),
        'Pago Vencido - Acción Requerida',
        'El pago de ${payment.full_name} está vencido. Se requiere seguimiento inmediato.',
        'high', false, false,
        $1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `, [payment.building_id, payment.unit_id, payment.contract_id, payment.id]);

    // Enviar email al inquilino
    await sendEmail({
      to: payment.email,
      subject: '⚠️ Pago Vencido - Acción Requerida',
      text: 'Su pago ha vencido. Por favor contacte administración.'
    });
  }

  console.log(`✅ ${overduePayments.length} pagos marcados como vencidos`);
});
```

---

## 📝 3. Contratos por Vencer

### Funcionamiento
- **Ejecución**: Cron Job semanal los **Lunes a las 9:00 AM**
- **Consulta**: Busca contratos activos con `end_date` en próximos 60 días

```sql
SELECT c.*, u.*, t.*, b.*
FROM contracts c
INNER JOIN units u ON c.unit_id = u.id
INNER JOIN tenants t ON c.tenant_id = t.id
INNER JOIN buildings b ON u.building_id = b.id
WHERE c.status = 'active'
  AND c.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'
```

### Acciones Automáticas
1. Genera alerta para administrador
2. Envía email recordatorio
3. Marca en dashboard como "Acción Requerida"

### Implementación
```typescript
cron.schedule('0 9 * * 1', async () => { // Lunes 9 AM
  console.log('📝 Ejecutando job de contratos por vencer...');
  
  const expiringContracts = await executeQuery(`
    SELECT c.*, u.unit_number, t.full_name, t.email, b.name as building_name,
           DATE_PART('day', c.end_date - CURRENT_DATE) as days_until_expiry
    FROM contracts c
    INNER JOIN units u ON c.unit_id = u.id
    INNER JOIN tenants t ON c.tenant_id = t.id
    INNER JOIN buildings b ON u.building_id = b.id
    WHERE c.status = 'active'
      AND c.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'
  `);

  for (const contract of expiringContracts) {
    await executeQuery(`
      INSERT INTO alerts (
        alert_type_id, title, message, priority, is_read, is_resolved,
        building_id, unit_id, contract_id, created_at, updated_at
      ) VALUES (
        (SELECT id FROM alert_types WHERE name = 'Contrato por Vencer'),
        'Contrato por Vencer - Programar Renovación',
        'El contrato de ${contract.full_name} (Unidad ${contract.unit_number}) vence en ${contract.days_until_expiry} días.',
        'medium', false, false,
        $1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `, [contract.building_id, contract.unit_id, contract.id]);
  }

  console.log(`✅ ${expiringContracts.length} contratos próximos a vencer identificados`);
});
```

---

## 🔧 4. Mantenimiento (Trigger en Base de Datos)

### Trigger SQL
```sql
CREATE OR REPLACE FUNCTION create_maintenance_alert()
RETURNS TRIGGER AS $$
DECLARE
  alert_type_id INTEGER;
  alert_priority VARCHAR(10);
BEGIN
  -- Obtener ID del tipo de alerta
  SELECT id INTO alert_type_id 
  FROM alert_types 
  WHERE name = 'Mantenimiento' 
  LIMIT 1;

  -- Determinar prioridad de la alerta según prioridad de la solicitud
  alert_priority := CASE 
    WHEN NEW.priority = 'high' THEN 'high'
    WHEN NEW.priority = 'medium' THEN 'medium'
    ELSE 'low'
  END;

  -- Crear alerta automáticamente
  INSERT INTO alerts (
    alert_type_id, title, message, priority, is_read, is_resolved,
    building_id, unit_id, created_at, updated_at
  ) VALUES (
    alert_type_id,
    'Nueva Solicitud de Mantenimiento - ' || NEW.category,
    NEW.description,
    alert_priority,
    false,
    false,
    (SELECT building_id FROM units WHERE id = NEW.unit_id),
    NEW.unit_id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_maintenance_alert
AFTER INSERT ON maintenance_requests
FOR EACH ROW
EXECUTE FUNCTION create_maintenance_alert();
```

---

## 🏠 5. Unidad Desocupada (Trigger + Lógica de Negocio)

### Implementación en ContractController
```typescript
// Al finalizar un contrato
async function completeContract(contractId: number) {
  const contract = await Contract.findByPk(contractId, {
    include: [Unit]
  });

  // Actualizar contrato
  contract.status = 'completed';
  contract.end_date = new Date();
  await contract.save();

  // Cambiar estado de la unidad
  const unit = contract.Unit;
  unit.occupation_status = 'vacant';
  await unit.save();

  // Crear alerta automáticamente
  await Alert.create({
    alert_type_id: (await AlertType.findOne({ where: { name: 'Unidad Desocupada' } })).id,
    title: `Unidad ${unit.unit_number} Disponible`,
    message: `La unidad ${unit.unit_number} está desocupada y lista para nuevo arrendamiento.`,
    priority: 'low',
    is_read: false,
    is_resolved: false,
    building_id: unit.building_id,
    unit_id: unit.id,
    contract_id: contractId
  });

  // Audit log
  await AuditLog.create({
    user_id: getCurrentUser().id,
    action: 'contract_completed',
    entity_type: 'Contract',
    entity_id: contractId,
    description: `Contrato finalizado - Unidad ${unit.unit_number} ahora disponible`
  });
}
```

---

## 📊 Resumen de Implementación

| Tipo de Alerta | Método | Frecuencia | Prioridad | Implementado |
|----------------|--------|------------|-----------|--------------|
| Recordatorio Pago | Cron Job | Diario 6:00 AM | Medium | ❌ Pendiente |
| Pago Vencido | Cron Job | Diario 8:00 AM | High | ❌ Pendiente |
| Contrato por Vencer | Cron Job | Semanal Lunes 9 AM | Medium | ❌ Pendiente |
| Mantenimiento | DB Trigger | Inmediato | Variable | ❌ Pendiente |
| Unidad Desocupada | Lógica Negocio | Al evento | Low | ❌ Pendiente |

---

## 🚀 Próximos Pasos

1. **Instalar dependencia de cron**:
   ```bash
   npm install node-cron
   npm install @types/node-cron --save-dev
   ```

2. **Crear archivo de jobs**:
   ```
   backend/src/jobs/
   ├── paymentReminders.ts
   ├── overduePayments.ts
   ├── expiringContracts.ts
   └── index.ts
   ```

3. **Inicializar jobs en index.ts**:
   ```typescript
   import './jobs';
   ```

4. **Crear triggers en PostgreSQL**:
   ```bash
   psql -U postgres -d apartamentos_db -f backend/database/triggers/maintenance_alerts.sql
   ```

5. **Configurar servicio de email** (ya existe en `config/email.ts`)

---

## ✅ Conclusión

**TODAS LAS ALERTAS SON AUTOMÁTICAS**. El sistema debe:
- ✅ Enviar recordatorios 5 días antes del vencimiento
- ✅ Cambiar automáticamente pagos a "Vencido" cuando pasa la fecha
- ✅ Notificar contratos próximos a vencer
- ✅ Crear alertas al registrar mantenimiento
- ✅ Avisar cuando una unidad queda disponible

**NUNCA se crean alertas manualmente**, todo es gestionado por el sistema automáticamente.
