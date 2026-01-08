# 📎 Sistema de Comprobantes de Pago

## ✅ Cambios Implementados

### 1. Campo para Comprobantes
Se agregó el campo `receipt_file_path` a las transacciones de pago para guardar la ruta del comprobante.

### 2. Generación Inteligente de Pagos
El sistema ahora genera pagos **según la duración real del contrato**, NO siempre 12 meses.

---

## 📋 Migración de Base de Datos

**IMPORTANTE**: Ejecuta este script SQL en tu base de datos:

```sql
ALTER TABLE payment_transactions 
ADD COLUMN IF NOT EXISTS receipt_file_path VARCHAR(500);

COMMENT ON COLUMN payment_transactions.receipt_file_path IS 'Ruta del archivo del comprobante de pago/transferencia';
```

O ejecuta el archivo: `migrations/add_receipt_field.sql`

---

## 💡 Cómo Funciona

### Ejemplo: Contrato de 4 meses (Apartaestudio)

```json
POST /api/contracts
{
  "unit_id": 1,
  "tenant_id": 1,
  "start_date": "2025-02-01",
  "end_date": "2025-05-31",
  "monthly_rent": 800000,
  "payment_day": 5,
  "status": "active"
}
```

**Resultado:**
✅ Se generan solo **4 pagos** (Febrero, Marzo, Abril, Mayo)

```json
{
  "success": true,
  "message": "Contrato creado exitosamente. Se generaron 4 pagos mensuales automáticamente.",
  "paymentsGenerated": 4
}
```

### Ejemplo: Contrato de 1 año

```json
{
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"
}
```

**Resultado:** ✅ Se generan **12 pagos**

### Ejemplo: Contrato de 6 meses

```json
{
  "start_date": "2025-01-01",
  "end_date": "2025-06-30"
}
```

**Resultado:** ✅ Se generan **6 pagos**

---

## 📎 Subir Comprobante de Pago

### Opción 1: Guardar ruta del archivo

```json
POST /api/payments/1/transactions
{
  "amount": 800000,
  "transaction_date": "2025-02-03",
  "payment_method": "transferencia",
  "reference_number": "TRX-20250203-001",
  "receipt_file_path": "/uploads/receipts/2025/02/comprobante_pago_feb.pdf",
  "notes": "Pago mes de febrero"
}
```

### Opción 2: Sistema de Subida de Archivos (Próximo)

En una futura versión se puede implementar un endpoint para subir archivos:

```
POST /api/uploads/receipt
Content-Type: multipart/form-data
```

Que retornaría la ruta del archivo guardado.

---

## 🎯 Casos de Uso Reales

### 1. Apartaestudio para Estudiantes (4 meses - 1 semestre)
```json
{
  "start_date": "2025-02-01",
  "end_date": "2025-05-31"
}
```
→ **4 pagos generados**

### 2. Apartamento Corto Plazo (3 meses)
```json
{
  "start_date": "2025-07-01",
  "end_date": "2025-09-30"
}
```
→ **3 pagos generados**

### 3. Arrendamiento Anual (12 meses)
```json
{
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"
}
```
→ **12 pagos generados**

### 4. Subarrendamiento (2 meses)
```json
{
  "start_date": "2025-08-01",
  "end_date": "2025-09-30"
}
```
→ **2 pagos generados**

---

## 📊 Ventajas

✅ **Flexibilidad total**: Contratos de cualquier duración  
✅ **Comprobantes adjuntos**: Evidencia de cada pago  
✅ **Seguimiento completo**: Historial de abonos con comprobantes  
✅ **Automatización**: Se generan solo los pagos necesarios  
✅ **Trazabilidad**: Cada transacción tiene su comprobante

---

## 🔧 Próximas Mejoras Sugeridas

1. **Endpoint para subir archivos**: `POST /api/uploads/receipt`
2. **Validación de formatos**: PDF, JPG, PNG
3. **Límite de tamaño**: Máx 5MB
4. **Almacenamiento**: Carpeta organizada por año/mes
5. **Descarga de comprobantes**: `GET /api/payments/transactions/:id/receipt`

---

## 📝 Ejemplos con Comprobantes

### Pago completo con comprobante
```json
POST /api/payments/1/transactions
{
  "amount": 1200000,
  "transaction_date": "2025-01-05",
  "payment_method": "transferencia",
  "reference_number": "PSE-20250105-12345",
  "receipt_file_path": "/uploads/receipts/2025/01/tenant_1_pago_enero.pdf",
  "notes": "Pago completo mes de enero - Transferencia PSE"
}
```

### Primer abono con comprobante
```json
POST /api/payments/2/transactions
{
  "amount": 600000,
  "transaction_date": "2025-02-02",
  "payment_method": "efectivo",
  "receipt_file_path": "/uploads/receipts/2025/02/tenant_1_abono1_feb.jpg",
  "notes": "Primer abono 50% - Recibo de caja"
}
```

### Segundo abono con comprobante
```json
POST /api/payments/2/transactions
{
  "amount": 600000,
  "transaction_date": "2025-02-10",
  "payment_method": "transferencia",
  "reference_number": "BANC-20250210-67890",
  "receipt_file_path": "/uploads/receipts/2025/02/tenant_1_abono2_feb.pdf",
  "notes": "Segundo abono 50% - Completado"
}
```

---

## 🗂️ Estructura de Carpetas Sugerida

```
backend/
├── uploads/
│   └── receipts/
│       ├── 2025/
│       │   ├── 01/
│       │   │   ├── tenant_1_pago_enero.pdf
│       │   │   └── tenant_2_pago_enero.jpg
│       │   ├── 02/
│       │   │   ├── tenant_1_abono1_feb.jpg
│       │   │   └── tenant_1_abono2_feb.pdf
│       │   └── ...
│       └── 2026/
│           └── ...
```
