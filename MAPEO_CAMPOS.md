# Mapeo de Campos - Backend vs Frontend

## Problema Resuelto
El backend y frontend usaban nombres de campos diferentes para las mismas propiedades, causando que datos no se mostraran correctamente o se perdieran en la comunicación.

## Solución Implementada
Se crearon **Data Mappers** en el backend (`src/utils/mappers.ts`) que normalizan los datos antes de enviarlos al frontend, asegurando consistencia.

---

## 📊 Mapeo de Campos por Entidad

### Buildings (Edificios)
| Backend (DB)          | Frontend (esperado) | Mapper normaliza a |
|-----------------------|---------------------|-------------------|
| `id` / `building_id`  | `id`               | `id`              |
| `postal_code`         | `zip_code`         | `postal_code`     |
| `construction_year`   | `year_built`       | `construction_year` |
| `total_floors`        | `floors`           | `total_floors`    |

**Mapper:** `BuildingMapper.toDTO()`

---

### Units (Unidades)
| Backend (DB)          | Frontend (esperado) | Mapper normaliza a |
|-----------------------|---------------------|-------------------|
| `id` / `unit_id`      | `id`               | `id`              |
| `occupation_status`   | `status`           | `occupation_status` |
| `is_occupied`         | boolean            | `is_occupied`     |

**Mapper:** `UnitMapper.toDTO()`

---

### Payments (Pagos) ⚠️ **CRÍTICO**
| Backend (DB)             | Frontend (esperado) | Mapper normaliza a |
|--------------------------|---------------------|-------------------|
| `id`                     | `id` / `payment_id` | `id` y `payment_id` (alias) |
| `payment_status_id` (FK) | `status` (string)   | `payment_status_id` + `status_name` |
| `amount_due`             | `amount`            | `amount_due` |
| `amount_paid`            | N/A                 | `amount_paid` |
| `balance` (computed)     | N/A                 | `balance` |

**Mapper:** `PaymentMapper.toEnhancedDTO()`

**Importante:** 
- El frontend espera `status` como string (`'Pendiente'`, `'Pagado'`, etc.)
- El backend almacena `payment_status_id` (1, 2, 3, etc.)
- El mapper agrega `status_name` con el valor legible

---

### Contracts (Contratos)
| Backend (DB)          | Frontend (esperado) | Mapper normaliza a |
|-----------------------|---------------------|-------------------|
| `id` / `contract_id`  | `id`               | `id`              |
| `status`              | `status`           | `status`          |
| `monthly_rent`        | `monthly_rent`     | `monthly_rent` (parseFloat) |

**Mapper:** `ContractMapper.toDTO()`

---

### Expenses (Gastos)
| Backend (DB)             | Frontend (esperado) | Mapper normaliza a |
|--------------------------|---------------------|-------------------|
| `id` / `expense_id`      | `id`               | `id` y `expense_id` (alias) |
| `expense_category_id`    | `category_id`      | `expense_category_id` + `category_name` |
| `amount`                 | `amount`           | `amount` (parseFloat) |

**Mapper:** `ExpenseMapper.toEnhancedDTO()`

---

### Alerts (Alertas) ⚠️ **CRÍTICO**
| Backend (DB)          | Frontend (esperado) | Mapper normaliza a |
|-----------------------|---------------------|-------------------|
| `is_read` (boolean)   | `status` (string)  | `status` |
| `is_resolved` (boolean)| `status` (string) | `status` |
| `email_sent`          | N/A                | `email_sent` |

**Mapper:** `AlertMapper.toDTO()`

**Mapeo de Status:**
- `is_resolved = true` → `status = 'dismissed'`
- `is_read = true` → `status = 'read'`
- `email_sent = true` → `status = 'sent'`
- Por defecto → `status = 'pending'`

---

## 🔧 Paginación

### Normalización de Paginación
Diferentes endpoints devolvían estructuras de paginación distintas. Ahora todas se normalizan a:

```typescript
{
  page: number;          // Página actual
  limit: number;         // Elementos por página
  total: number;         // Total de elementos
  totalPages: number;    // Total de páginas
  currentPage: number;   // Alias de page
  itemsPerPage: number;  // Alias de limit
  totalItems: number;    // Alias de total
  hasNextPage: boolean;  // ¿Hay página siguiente?
  hasPrevPage: boolean;  // ¿Hay página anterior?
}
```

**Mapper:** `PaginationMapper.normalize()`

---

## 📝 Uso de Mappers

### Backend (Controladores)

```typescript
import { PaymentMapper } from '../utils/mappers';

// En el controlador
const payments = await PaymentModel.findAll(filters);
const normalizedPayments = PaymentMapper.toEnhancedDTOList(payments);

return res.json({ 
  success: true, 
  data: normalizedPayments 
});
```

### Frontend (Servicios)

El frontend ahora recibe datos normalizados directamente del backend. No necesita transformaciones adicionales.

```typescript
// Antes (necesitaba transformar)
const payment = {
  ...response.data,
  id: response.data.id || response.data.payment_id
};

// Ahora (datos ya normalizados)
const payment = response.data; // ✅ Listo para usar
```

---

## ✅ Controladores Actualizados

- ✅ `PaymentController` - Usa `PaymentMapper`
- ✅ `BuildingController` - Usa `BuildingMapper` y `PaginationMapper`
- ✅ `ContractController` - Usa `ContractMapper` y `PaginationMapper`
- ✅ `ExpenseController` - Usa `ExpenseMapper` y `PaginationMapper`
- ✅ `TenantController` - Usa `TenantMapper` y `PaginationMapper`
- ✅ `UnitController` - Usa `UnitMapper` y `PaginationMapper`

---

## 🎯 Próximos Pasos

1. Aplicar mappers a los controladores restantes
2. Actualizar frontend para eliminar transformaciones duplicadas
3. Compilar backend: `cd backend && npx tsc`
4. Reiniciar servidores
5. Probar flujos completos de datos

---

## 🐛 Debugging

Si encuentras datos inconsistentes:

1. Verifica que el controlador use el mapper correcto
2. Revisa que el frontend no esté transformando datos ya normalizados
3. Usa `console.log` en el mapper para verificar la entrada/salida:

```typescript
// En mappers.ts
static toDTO(dbPayment: any): Payment {
  console.log('🔍 PaymentMapper INPUT:', dbPayment);
  const result = { /* ... */ };
  console.log('✅ PaymentMapper OUTPUT:', result);
  return result;
}
```

---

## 📚 Referencia Rápida

- **Mappers Backend:** `backend/src/utils/mappers.ts`
- **Interfaces Backend:** `backend/src/interfaces/index.ts`
- **Models Frontend:** `front/src/app/features/*/models/*.model.ts`
- **Controladores:** `backend/src/controllers/`
