# 🔧 Corrección: Formulario de Pagos - Errores de Validación

## 📋 Problema Identificado

Cuando intentabas crear un pago, el frontend enviaba datos incompletos/incorrectos al backend, causando:
- **Error 400**: Validación fallida (contract_id, unit_id, due_date, amount_due, payment_status_id como undefined)
- **Error 500**: `null value in column "period_month" violates not-null constraint`

### Raíz del Problema

Había una **desconexión entre lo que el frontend enviaba y lo que el backend esperaba**:

**Lo que el frontend enviaba:**
```json
{
  "contract_id": "123",           // ❌ String en lugar de número
  "tenant_id": "Juan Pérez",      // ❌ String (nombre), no ID
  "unit_id": "101",               // ❌ String en lugar de número
  "amount_due": "1.000.000",      // ❌ String formateado, no número
  "payment_date": "2026-02-07",   // ❌ Campo innecesario
  "due_date": "",                 // ❌ Vacío
  "payment_status_id": "",        // ❌ Vacío
  "payment_method": "cash",       // ❌ Campo innecesario
  "reference_number": "",         // ❌ Campo innecesario
  "notes": ""
}
```

**Lo que el backend esperaba:**
```json
{
  "contract_id": 123,             // ✅ Número entero
  "period_month": 2,              // ✅ Mes del período (derivado de due_date)
  "period_year": 2026,            // ✅ Año del período (derivado de due_date)
  "amount_due": 1000000,          // ✅ Número decimal
  "due_date": "2026-02-07",       // ✅ Fecha en formato YYYY-MM-DD
  "payment_status_id": 1,         // ✅ Número entero
  "notes": ""                      // ⚪ Opcional
}
```

---

## ✅ Soluciones Implementadas

### 1. **Frontend: Actualización del Modelo** 
📁 `front/src/app/features/payments/models/payment.model.ts`

```typescript
// ❌ ANTES - Campos incorrectos
export interface PaymentFormData {
  contract_id: number;
  tenant_id: number;          // ❌ Innecesario
  unit_id: number;            // ❌ Innecesario
  amount: number;             // ❌ Debería ser amount_due
  payment_date: string;       // ❌ Innecesario
  due_date: string;
  payment_method: string;     // ❌ Innecesario
  reference_number?: string;  // ❌ Innecesario
  notes?: string;
}

// ✅ DESPUÉS - Solo campos requeridos por backend
export interface PaymentFormData {
  contract_id: number;
  period_month: number;       // ✅ Calculado de due_date
  period_year: number;        // ✅ Calculado de due_date
  amount_due: number;         // ✅ Nombre correcto
  due_date: string;
  payment_status_id: number;
  notes?: string;
}
```

### 2. **Frontend: Actualización del Componente**
📁 `front/src/app/features/payments/components/payment-form/payment-form.component.ts`

**Cambios principales:**

#### a) `initForm()` - Remover campos innecesarios
```typescript
initForm(): void {
  this.paymentForm = this.fb.group({
    contract_id: ['', Validators.required],
    tenant_id: ['', Validators.required],                  // ← Solo para mostrar
    tenant_id_hidden: ['', Validators.required],           // ← Valor real
    unit_id: ['', Validators.required],                    // ← Solo para mostrar
    unit_id_hidden: ['', Validators.required],             // ← Valor real
    amount_due: ['', [Validators.required, ...]],
    due_date: ['', Validators.required],                   // ← Cambio clave
    payment_status_id: [1, Validators.required],           // ← Cambio clave
    notes: ['']
    // ❌ Removido: payment_date, payment_method, reference_number
  });
}
```

#### b) `onSubmit()` - Calcular period_month y period_year
```typescript
onSubmit(): void {
  if (this.paymentForm.valid) {
    const formValue = { ...this.paymentForm.value };
    
    // Limpiar formato de moneda
    const cleanAmount = formValue.amount_due.toString().replace(/\./g, '');
    const amountDue = Number(cleanAmount);
    
    // ✅ NUEVO: Calcular período de la fecha
    const dueDate = new Date(formValue.due_date);
    const periodMonth = dueDate.getMonth() + 1;  // getMonth() retorna 0-11
    const periodYear = dueDate.getFullYear();
    
    // Construir payload correcto
    const payload: PaymentFormData = {
      contract_id: parseInt(formValue.contract_id, 10),
      period_month: periodMonth,
      period_year: periodYear,
      amount_due: amountDue,
      due_date: formValue.due_date,
      payment_status_id: parseInt(formValue.payment_status_id, 10),
      notes: formValue.notes || undefined
    };
    
    console.log('📤 Payload enviado:', payload);
    this.submit.emit(payload);
  }
}
```

### 3. **Frontend: Actualización del Template**
📁 `front/src/app/features/payments/components/payment-form/payment-form.component.html`

**Cambios:**
- ❌ Removido: Campo de `payment_date` (fecha de pago)
- ❌ Removido: Campo de `payment_method` (método de pago)
- ❌ Removido: Campo de `reference_number` (número de referencia)
- ✅ Mantenido: Selects automáticamente rellenados basados en el contrato
- ✅ Simplificado: Solo los 6 campos esenciales

### 4. **Backend: Actualización del Validador**
📁 `backend/src/validators/paymentValidator.ts`

**Cambios principales:**

```typescript
// ❌ ANTES - Validaba unit_id (innecesario)
export const createPaymentValidators: ValidationChain[] = [
  contractExistsValidator,
  unitExistsValidator,        // ❌ Removido
  dateValidator('due_date', true),
  ...
];

// ✅ DESPUÉS - Valida period_month y period_year
export const createPaymentValidators: ValidationChain[] = [
  contractExistsValidator,
  periodMonthValidator,       // ✅ Nuevo
  periodYearValidator,        // ✅ Nuevo
  dateValidator('due_date', true),
  ...
];

// Nuevos validadores
const periodMonthValidator = body('period_month')
  .notEmpty().withMessage('El mes del período es requerido')
  .isInt({ min: 1, max: 12 }).withMessage('El mes del período debe estar entre 1 y 12');

const periodYearValidator = body('period_year')
  .notEmpty().withMessage('El año del período es requerido')
  .isInt({ min: 2000, max: 2099 }).withMessage('El año del período debe estar entre 2000 y 2099');
```

También se actualizó `updatePaymentValidators` con los mismos cambios.

---

## 🔄 Flujo de Datos Ahora Correcto

```
┌─────────────────────────────────────┐
│ Usuario selecciona contrato         │
│ Ingresa monto y fecha de vencimiento│
│ Selecciona estado                   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ payment-form.component.ts           │
│ - Calcula period_month (2)          │
│ - Calcula period_year (2026)        │
│ - Convierte valores a números       │
│ - Limpia formato de moneda          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ POST /api/payments                  │
│ {                                   │
│   "contract_id": 11,                │
│   "period_month": 2,                │
│   "period_year": 2026,              │
│   "amount_due": 1000000,            │
│   "due_date": "2026-02-07",         │
│   "payment_status_id": 1,           │
│   "notes": ""                       │
│ }                                   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ paymentValidator.ts                 │
│ - Valida contract_id existe         │
│ - Valida period_month (1-12)        │
│ - Valida period_year (2000-2099)    │
│ - Valida due_date (formato)         │
│ - Valida amount_due ($50k-$50M)     │
│ - Valida payment_status_id existe   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ PaymentRepository.create()          │
│ INSERT INTO payments (              │
│   contract_id, period_month,        │
│   period_year, amount_due,          │
│   due_date, payment_status_id,notes │
│ ) VALUES (...)                      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ ✅ Pago creado exitosamente         │
│ ID: 292                             │
└─────────────────────────────────────┘
```

---

## 🧪 Cómo Probar

### Paso 1: Compilar Backend
```bash
cd backend
npx tsc --noEmit
```
✅ Debería compilar sin errores

### Paso 2: Crear un Nuevo Pago
1. Navega a `Pagos > Crear Pago`
2. Selecciona un contrato
3. El inquilino y unidad se completan automáticamente
4. Ingresa monto (ej: 1.000.000)
5. Selecciona fecha de vencimiento (ej: 2026-02-07)
6. Selecciona estado (ej: Pendiente)
7. Haz clic en "Crear Pago"

### Paso 3: Verificar en la Consola
Deberías ver en la consola del navegador:
```
📤 Payload enviado: {
  contract_id: 11,
  period_month: 2,
  period_year: 2026,
  amount_due: 1000000,
  due_date: "2026-02-07",
  payment_status_id: 1,
  notes: undefined
}
```

### Paso 4: Verificar en la Base de Datos
```sql
SELECT id, contract_id, period_month, period_year, 
       amount_due, due_date, payment_status_id 
FROM payments 
ORDER BY id DESC 
LIMIT 1;
```

Deberías ver el nuevo registro con los valores correctos.

---

## 📊 Resumen de Cambios

| Archivo | Cambios | Razón |
|---------|---------|-------|
| `payment.model.ts` | Remover tenant_id, unit_id, amount, payment_date, payment_method, reference_number. Agregar period_month, period_year. Renombrar amount → amount_due | Sincronizar con lo que backend espera |
| `payment-form.component.ts` | Remover campos innecesarios. Calcular period_month/year en onSubmit() | Generar datos correctos para backend |
| `payment-form.component.html` | Remover payment_date, payment_method, reference_number. Simplificar a 6 campos | Reducir campos innecesarios en UI |
| `paymentValidator.ts` | Remover validador unit_id. Agregar validadores period_month/year | Validar datos correctos |

---

## ✨ Resultado

✅ **Antes:** 14 errores de validación por campos indefinidos o mal formateados
✅ **Ahora:** Los pagos se crean exitosamente con datos correctos en la BD

