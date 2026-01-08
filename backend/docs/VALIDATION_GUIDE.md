# 🛡️ Sistema de Validación Robusta de Datos

## ✅ Implementación Completada

Se ha implementado validación robusta usando **express-validator** en todos los endpoints de la API.

---

## 📋 Validaciones Implementadas

### 1. **Edificios (Buildings)**

#### POST /api/buildings
```json
{
  "name": "Torre Central",              // ✅ Requerido, 2-255 caracteres
  "address": "Calle 123 #45-67",        // ✅ Requerido, 5-500 caracteres
  "city": "Bogotá",                     // ⚪ Opcional, 2-100 caracteres
  "state": "Cundinamarca",              // ⚪ Opcional, 2-100 caracteres
  "postal_code": "110111",              // ⚪ Opcional, 6 dígitos exactos
  "total_floors": 15,                   // ⚪ Opcional, 1-200
  "total_units": 50,                    // ⚪ Opcional, 1-1000
  "max_capacity": 200,                  // ⚪ Opcional, 1-10000
  "description": "...",                 // ⚪ Opcional, máx 1000 caracteres
  "construction_year": 2020             // ⚪ Opcional, 1900-2030
}
```

**Errores comunes:**
```json
{
  "success": false,
  "error": "Errores de validación",
  "details": [
    {
      "field": "name",
      "message": "El nombre debe tener entre 2 y 255 caracteres",
      "value": "T"
    },
    {
      "field": "postal_code",
      "message": "El código postal debe tener 6 dígitos",
      "value": "1101"
    }
  ]
}
```

---

### 2. **Unidades (Units)**

#### POST /api/units
```json
{
  "building_id": 1,                     // ✅ Requerido, debe existir y estar activo
  "unit_type_id": 1,                    // ✅ Requerido, debe existir y estar activo
  "unit_number": "101",                 // ✅ Requerido, 1-20 caracteres
  "floor": 1,                           // ⚪ Opcional, -5 a 200 (sótanos permitidos)
  "area_sqm": 45.5,                     // ⚪ Opcional, 1-10000 m²
  "bedrooms": 2,                        // ⚪ Opcional, 0-20
  "bathrooms": 1.5,                     // ⚪ Opcional, 0-10 (permite 0.5)
  "rental_price": 800000,               // ✅ Requerido, $50,000 - $50,000,000
  "occupation_status": "vacant",        // ✅ Requerido: vacant|occupied|maintenance|reserved
  "description": "..."                  // ⚪ Opcional, máx 1000 caracteres
}
```

**Validaciones especiales:**
- ✅ **building_id**: Verifica en BD que el edificio existe y está activo
- ✅ **unit_type_id**: Verifica en BD que el tipo existe
- ✅ **rental_price**: Mínimo $50,000, máximo $50,000,000 COP

**Errores comunes:**
```json
{
  "field": "building_id",
  "message": "El edificio con ID 999 no existe o no está activo"
},
{
  "field": "rental_price",
  "message": "El monto mínimo es $50,000 COP"
}
```

---

### 3. **Inquilinos (Tenants)**

#### POST /api/tenants
```json
{
  "document_type": "CC",                // ✅ Requerido: CC|CE|TI|NIT|PP|PEP
  "document_number": "1234567890",      // ✅ Requerido, solo números, 6-15 dígitos
  "first_name": "Juan",                 // ✅ Requerido, 2-100 caracteres
  "last_name": "Pérez",                 // ✅ Requerido, 2-100 caracteres
  "email": "juan@gmail.com",            // ✅ Requerido, email válido, NO temporales
  "phone": "6012345678",                // ⚪ Opcional, formato Colombia
  "mobile_phone": "3012345678",         // ⚪ Opcional, 10 dígitos, empieza con 3
  "emergency_contact_name": "María",    // ⚪ Opcional, 2-255 caracteres
  "emergency_contact_phone": "3109876543", // ⚪ Opcional, móvil válido
  "occupation": "Ingeniero",            // ⚪ Opcional, 2-100 caracteres
  "company_name": "Tech Corp",          // ⚪ Opcional, 2-255 caracteres
  "monthly_income": 5000000,            // ⚪ Opcional, valor positivo
  "notes": "..."                        // ⚪ Opcional, máx 1000 caracteres
}
```

**Validaciones especiales:**

#### 📧 Email - NO permite temporales
```javascript
// ❌ RECHAZADOS
juan@yopmail.com
test@guerrillamail.com
user@mailinator.com
temp@10minutemail.com

// ✅ ACEPTADOS
juan@gmail.com
maria@outlook.com
pedro@hotmail.com
empresa@midominio.com
```

#### 📞 Teléfonos Colombia - Formato estricto

**Móviles:**
```javascript
✅ 3012345678  // 10 dígitos, empieza con 3
✅ 3201234567
✅ 3509876543
❌ 2012345678  // No empieza con 3
❌ 301234567   // Solo 9 dígitos
```

**Fijos:**
```javascript
// Bogotá (7 dígitos)
✅ 1234567
✅ 1987654

// Con indicativo (10 dígitos)
✅ 6012345678  // Bogotá con indicativo
✅ 6022345678  // Cali
✅ 6042345678  // Medellín

❌ 12345      // Muy corto
❌ 7012345678 // Indicativo inválido
```

**Errores comunes:**
```json
{
  "field": "email",
  "message": "No se permiten emails temporales. Use un email válido como Gmail, Outlook, etc."
},
{
  "field": "mobile_phone",
  "message": "El número móvil debe tener 10 dígitos y comenzar con 3 (ej: 3012345678)"
},
{
  "field": "phone",
  "message": "El teléfono fijo debe ser: 7 dígitos para Bogotá (ej: 1234567) o 10 dígitos con indicativo (ej: 6012345678)"
}
```

---

### 4. **Contratos (Contracts)**

#### POST /api/contracts
```json
{
  "unit_id": 1,                         // ✅ Requerido, debe existir y estar activo
  "tenant_id": 1,                       // ✅ Requerido, debe existir y estar activo
  "start_date": "2025-01-01",           // ✅ Requerido, formato YYYY-MM-DD
  "end_date": "2025-05-01",             // ✅ Requerido, mínimo 1 mes después de start_date
  "monthly_rent": 800000,               // ✅ Requerido, $50,000 - $50,000,000
  "deposit_amount": 800000,             // ✅ Requerido, $50,000 - $50,000,000
  "payment_day": 5,                     // ✅ Requerido, día 1-31
  "status": "active",                   // ✅ Requerido: active|pending|finished|cancelled
  "notes": "..."                        // ⚪ Opcional, máx 1000 caracteres
}
```

**Validaciones especiales:**
- ✅ **unit_id**: Verifica que la unidad existe
- ✅ **tenant_id**: Verifica que el inquilino existe
- ✅ **Fechas**: Permite fechas pasadas (para registros históricos)
- ✅ **Duración**: Mínimo 1 mes, sin máximo (Colombia no tiene normativa)
- ✅ **end_date > start_date**: Validación automática

**Ejemplos de duración:**
```json
// ✅ VÁLIDOS
{
  "start_date": "2025-01-01",
  "end_date": "2025-02-01"  // 1 mes - OK
}
{
  "start_date": "2025-01-01",
  "end_date": "2025-05-01"  // 4 meses - OK (apartaestudios)
}
{
  "start_date": "2025-01-01",
  "end_date": "2026-01-01"  // 12 meses - OK
}
{
  "start_date": "2024-01-01",  // Fecha pasada permitida
  "end_date": "2024-12-01"
}

// ❌ INVÁLIDOS
{
  "start_date": "2025-01-01",
  "end_date": "2025-01-15"  // Menos de 1 mes
}
{
  "start_date": "2025-01-01",
  "end_date": "2024-12-01"  // end_date anterior a start_date
}
```

**Errores comunes:**
```json
{
  "field": "end_date",
  "message": "El contrato debe tener una duración mínima de 1 mes(es)"
},
{
  "field": "unit_id",
  "message": "La unidad con ID 999 no existe o no está activa"
}
```

---

### 5. **Pagos (Payments)**

#### POST /api/payments
```json
{
  "contract_id": 1,                     // ✅ Requerido, debe existir
  "unit_id": 1,                         // ✅ Requerido, debe existir y estar activo
  "due_date": "2025-02-05",             // ✅ Requerido, formato YYYY-MM-DD, permite pasadas
  "amount_due": 800000,                 // ✅ Requerido, $50,000 - $50,000,000
  "payment_status_id": 1,               // ✅ Requerido, debe existir
  "amount_paid": 0,                     // ⚪ Opcional, 0 - $50,000,000
  "notes": "..."                        // ⚪ Opcional, máx 1000 caracteres
}
```

#### POST /api/payments/:id/transactions
```json
{
  "payment_id": 1,                      // ✅ Requerido, debe existir
  "amount": 800000,                     // ✅ Requerido, > 0, máx $50,000,000
  "transaction_date": "2025-01-15",     // ✅ Requerido, permite fechas pasadas
  "transaction_method_id": 1,           // ✅ Requerido, debe existir
  "reference_number": "TRX-001",        // ⚪ Opcional, 1-100 caracteres
  "receipt_file_path": "/uploads/...", // ⚪ Opcional, máx 500 caracteres
  "notes": "..."                        // ⚪ Opcional, máx 1000 caracteres
}
```

**Validaciones especiales:**
- ✅ Verifica que `contract_id`, `unit_id`, `payment_status_id`, `transaction_method_id` existen en BD
- ✅ Montos validados en el rango $50,000 - $50,000,000 COP
- ✅ Transacciones deben tener monto > 0

---

## 🔒 Sanitización Automática

Todos los campos de texto son sanitizados automáticamente para prevenir XSS:

```javascript
// Input del usuario
{
  "name": "<script>alert('XSS')</script>Torre Central"
}

// Después de sanitización
{
  "name": "&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;Torre Central"
}
```

Campos sanitizados:
- ✅ `trim()` - Elimina espacios al inicio/fin
- ✅ `escape()` - Escapa caracteres HTML peligrosos
- ✅ `normalizeEmail()` - Normaliza emails (lowercase, etc.)

---

## 🚨 Manejo de Errores

### Formato de respuesta de error:
```json
{
  "success": false,
  "error": "Errores de validación",
  "details": [
    {
      "field": "email",
      "message": "El formato del email no es válido",
      "value": "not-an-email"
    },
    {
      "field": "rental_price",
      "message": "El monto mínimo es $50,000 COP",
      "value": 10000
    }
  ]
}
```

### Códigos de estado HTTP:
- `400` - Errores de validación
- `404` - Recurso no encontrado
- `409` - Conflicto (ej: documento duplicado)
- `500` - Error del servidor

---

## 📝 Cómo usar las validaciones

### En Postman:

1. **Enviar request con datos inválidos:**
```json
POST /api/tenants
{
  "document_type": "INVALID",
  "document_number": "abc",
  "first_name": "J",
  "email": "test@yopmail.com",
  "mobile_phone": "123"
}
```

2. **Recibirás errores detallados:**
```json
{
  "success": false,
  "error": "Errores de validación",
  "details": [
    {
      "field": "document_type",
      "message": "Tipo de documento inválido. Valores permitidos: CC, CE, TI, NIT, PP, PEP"
    },
    {
      "field": "document_number",
      "message": "El documento debe contener solo números (6-15 dígitos)"
    },
    {
      "field": "first_name",
      "message": "El nombre debe tener entre 2 y 100 caracteres"
    },
    {
      "field": "email",
      "message": "No se permiten emails temporales. Use un email válido como Gmail, Outlook, etc."
    },
    {
      "field": "mobile_phone",
      "message": "El número móvil debe tener 10 dígitos y comenzar con 3"
    }
  ]
}
```

---

## ✅ Checklist de Validación

### Edificios (Buildings)
- [x] Validar nombre (2-255 caracteres)
- [x] Validar dirección (5-500 caracteres)
- [x] Validar código postal (6 dígitos)
- [x] Validar año de construcción (1900-2030)
- [x] Sanitizar descripción

### Unidades (Units)
- [x] Validar que building_id existe
- [x] Validar que unit_type_id existe
- [x] Validar rental_price ($50,000 - $50,000,000)
- [x] Validar occupation_status (valores permitidos)

### Inquilinos (Tenants)
- [x] Validar email formato + bloquear temporales
- [x] Validar teléfono móvil (formato Colombia)
- [x] Validar teléfono fijo (formato Colombia)
- [x] Validar documento (solo números, 6-15 dígitos)
- [x] Validar tipo de documento (CC, CE, TI, etc.)

### Contratos (Contracts)
- [x] Validar que unit_id existe
- [x] Validar que tenant_id existe
- [x] Validar duración mínima (1 mes)
- [x] Validar end_date > start_date
- [x] Permitir fechas pasadas
- [x] Validar monthly_rent ($50,000 - $50,000,000)
- [x] Validar día de pago (1-31)

### Pagos (Payments)
- [x] Validar que contract_id existe
- [x] Validar que payment_status_id existe
- [x] Validar que transaction_method_id existe
- [x] Validar montos ($50,000 - $50,000,000)
- [x] Validar que monto transacción > 0

---

## 🎯 Ventajas del sistema implementado

1. ✅ **Validación antes de llegar a BD** - Previene errores de SQL
2. ✅ **Mensajes claros en español** - Fácil para el frontend mostrar errores
3. ✅ **Validación de relaciones** - Verifica que IDs existen antes de crear
4. ✅ **Sanitización automática** - Previene XSS y SQL injection
5. ✅ **Formato Colombia** - Teléfonos, documentos, montos en COP
6. ✅ **Emails seguros** - Bloquea dominios temporales
7. ✅ **Reutilizable** - Funciones comunes en validators/common.ts

---

## 🔧 Configuración Actual

### Montos:
- **Mínimo:** $50,000 COP
- **Máximo:** $50,000,000 COP

### Teléfonos:
- **Móviles:** 10 dígitos, empieza con 3 (ej: 3012345678)
- **Fijos Bogotá:** 7 dígitos (ej: 1234567) o 10 con indicativo (6012345678)
- **Fijos otras ciudades:** 10 dígitos con indicativo 60X

### Documentos:
- **Tipos permitidos:** CC, CE, TI, NIT, PP, PEP
- **Formato:** Solo números, 6-15 dígitos

### Contratos:
- **Duración mínima:** 1 mes
- **Duración máxima:** Sin límite
- **Fechas pasadas:** Permitidas (registros históricos)

### Emails:
- **Dominios bloqueados:** yopmail, guerrillamail, mailinator, temp-mail, etc.
- **Dominios permitidos:** Cualquier otro (gmail, outlook, hotmail, dominios propios)

---

## 📞 Soporte

Si necesitas modificar alguna validación:

1. **Cambiar montos:** Editar `validators/common.ts` → `moneyAmountValidator()`
2. **Cambiar teléfonos:** Editar `validators/common.ts` → `mobilePhoneValidator()`
3. **Agregar dominios bloqueados:** Editar `validators/common.ts` → `BLOCKED_EMAIL_DOMAINS`
4. **Cambiar duración contratos:** Editar `validators/contractValidator.ts` → `dateRangeValidator()`

**Estado:** ✅ Sistema de validación 100% funcional y probado
