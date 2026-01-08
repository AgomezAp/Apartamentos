# Fix: Problema de actualización de edificios

## Problema identificado

Al intentar actualizar la información de un edificio, los cambios no se reflejaban en la base de datos. El problema era un **desajuste en los nombres de los campos** entre el frontend y el backend:

### Mapeo de campos con problemas:

| Frontend (Angular)    | Backend (PostgreSQL) | Estado   |
|-----------------------|----------------------|----------|
| `zip_code`            | `postal_code`        | ✅ FIXED |
| `year_built`          | `construction_year`  | ✅ FIXED |
| `floors`              | `total_floors`       | ✅ FIXED |
| `country`             | (no existía)         | ✅ ADDED |
| `total_units`         | `total_units`        | ✅ OK    |

## Cambios realizados

### 1. Frontend (Angular)

**Archivo:** `front/src/app/features/buildings/services/building.service.ts`

- ✅ Agregado método `mapFormDataToBackend()` que convierte los nombres de campos del formulario a los nombres que espera el backend
- ✅ Actualizado `createBuilding()` para usar el mapeo
- ✅ Actualizado `updateBuilding()` para usar el mapeo

### 2. Backend (Node.js/Express)

**Archivos modificados:**

1. **`backend/src/interfaces/index.ts`**
   - ✅ Agregado campo `country?: string` a la interfaz `Building`

2. **`backend/src/repositories/BuildingRepository.ts`**
   - ✅ Agregado soporte para `country` en el método `create()`
   - ✅ Agregado soporte para `country` en el método `update()`
   - ✅ Agregado soporte para `total_units` en el método `update()`

3. **`backend/src/validators/buildingValidator.ts`**
   - ✅ Agregada validación para el campo `country`

### 3. Base de Datos

**Migración creada:** `backend/database/migrations/add_country_to_buildings.sql`

```sql
-- Agregar columna country a la tabla buildings
ALTER TABLE buildings ADD COLUMN country VARCHAR(100) DEFAULT 'México';
CREATE INDEX idx_buildings_country ON buildings(country);
UPDATE buildings SET country = 'México' WHERE country IS NULL;
```

**Script de ejecución:** `backend/run_migration.bat`

## Cómo aplicar los cambios

### Paso 1: Ejecutar migración de base de datos

**Opción A - Usando el script (Windows):**
```bash
cd backend
.\run_migration.bat
```

**Opción B - Manualmente:**
```bash
psql -U postgres -d apartamentos -f backend/database/migrations/add_country_to_buildings.sql
```

**Opción C - Desde pgAdmin:**
1. Abrir pgAdmin
2. Conectarse a la base de datos `apartamentos`
3. Abrir Query Tool
4. Copiar y ejecutar el contenido de `backend/database/migrations/add_country_to_buildings.sql`

### Paso 2: Reiniciar el backend

```bash
cd backend
npm start
```

### Paso 3: Probar la actualización

1. Ir a la página de edificios
2. Seleccionar un edificio
3. Hacer clic en "Editar"
4. Modificar cualquier campo (nombre, país, ciudad, código postal, etc.)
5. Hacer clic en "Actualizar"
6. ✅ Los cambios deberían reflejarse correctamente

## Verificación de la solución

### Test manual:

1. **Editar un edificio existente:**
   - Cambiar el país de "México" a otro país
   - Cambiar el código postal
   - Cambiar el año de construcción
   - Verificar que los cambios se guarden

2. **Crear un nuevo edificio:**
   - Llenar todos los campos del formulario
   - Verificar que se cree correctamente con todos los datos

### Verificar en la consola del navegador:

1. Abrir DevTools (F12)
2. Ir a la pestaña "Network"
3. Editar un edificio
4. Verificar la petición PUT a `/api/buildings/{id}`
5. Ver el payload enviado - debería contener:
   ```json
   {
     "postal_code": "12345",
     "construction_year": 2020,
     "total_floors": 10,
     "country": "México",
     ...
   }
   ```

## Campos mapeados automáticamente

El servicio ahora mapea automáticamente:

```typescript
Frontend → Backend
-----------------
zip_code       → postal_code
year_built     → construction_year
floors         → total_floors
country        → country
total_units    → total_units + max_capacity
```

## Notas importantes

- ⚠️ **IMPORTANTE:** Debes ejecutar la migración antes de usar las funciones de edición
- 🔄 Los edificios existentes tendrán `country = 'México'` por defecto
- ✅ El campo `country` es opcional
- ✅ El campo `zip_code` es opcional pero si se envía debe tener 6 dígitos
- ✅ Todos los campos undefined se eliminan antes de enviar al backend (no sobrescriben valores)

## Próximos pasos recomendados

1. ✅ Ejecutar la migración de base de datos
2. ✅ Reiniciar el backend
3. ✅ Probar la edición de edificios
4. 📝 Si todo funciona, marcar este issue como resuelto
