# 🔄 Auto-Creación de Tablas - Como Sequelize

## ✅ Implementación Completada

Ahora el sistema **crea las tablas automáticamente** al iniciar, similar a `sequelize.sync()`.

## 📝 Cómo Funciona

### Antes (Manual)
```bash
# Tenías que ejecutar manualmente:
psql "DATABASE_URL" -f database/schema_postgres.sql
```

### Ahora (Automático) ⚡
```typescript
// Al iniciar el servidor, automáticamente:
await DBconnect();  // ← Conecta Y crea tablas si no existen
```

## 🔧 Archivos Modificados

### 1. `src/config/initDatabase.ts` (NUEVO)
Verifica si las tablas existen y las crea automáticamente:

```typescript
export async function initDatabase(pool: Pool): Promise<void> {
  // 1. Verifica si la tabla 'buildings' existe
  const tablesExist = await pool.query(/* check query */);
  
  // 2. Si NO existe, lee y ejecuta schema_postgres.sql
  if (!tablesExist) {
    const schemaSql = fs.readFileSync('database/schema_postgres.sql');
    await pool.query(schemaSql);
    console.log('✅ 24 tablas creadas automáticamente');
  }
}
```

### 2. `src/config/database.ts`
Agregada función `DBconnect()`:

```typescript
export const DBconnect = async (): Promise<void> => {
  await testConnection();     // Verifica conexión
  await initDatabase(pool);   // Crea tablas si no existen
};
```

### 3. `src/index.ts`
Modificado para usar `DBconnect()`:

```typescript
async start(): Promise<void> {
  await DBconnect();  // ← Ahora crea tablas automáticamente
  alertService.start();
  // ...
}
```

## 🚀 Uso

### Primera Vez (Crea Tablas)
```bash
cd backend
npm start
```

**Salida:**
```
✅ Conexión a PostgreSQL establecida correctamente
🔄 Las tablas no existen. Creando schema...
✅ Schema de base de datos creado exitosamente
📊 Tablas creadas: 24 tablas, 3 vistas, triggers y datos iniciales
```

### Segunda Vez (Tablas Ya Existen)
```bash
npm start
```

**Salida:**
```
✅ Conexión a PostgreSQL establecida correctamente
✅ Las tablas ya existen en la base de datos
```

## 📊 Qué Se Crea Automáticamente

Al detectar que no existen tablas, el sistema ejecuta `schema_postgres.sql` que crea:

- ✅ **24 Tablas:** `buildings`, `units`, `tenants`, `contracts`, `payments`, etc.
- ✅ **3 Vistas:** `v_units_full`, `v_overdue_payments`, `v_vacant_units`
- ✅ **Triggers:** Auto-actualización de `updated_at`, lógica de ocupación de unidades, estados de pago
- ✅ **Índices:** 40+ índices para optimización
- ✅ **Datos Iniciales (Seed):**
  - 4 estados de pago (Pagado, Pendiente, Vencido, Parcial)
  - 5 tipos de alerta
  - 5 tipos de unidad (Apartamento, Apartaestudio, etc.)
  - 7 tipos de servicio (Agua, Luz, Gas, etc.)
  - 8 categorías de gastos
  - 10 configuraciones del sistema

## 🔍 Comparación con Sequelize

| Aspecto | Sequelize | Nuestra Implementación |
|---------|-----------|------------------------|
| **Creación de tablas** | `sequelize.sync()` | `DBconnect()` |
| **Detección automática** | ✅ | ✅ |
| **Ejecución al inicio** | ✅ | ✅ |
| **Modo** | `{ alter: true }` | Ejecuta SQL completo |
| **Ventaja** | ORM completo | Sin dependencias pesadas |

## ⚙️ Configuración

No requiere configuración adicional. Solo asegúrate de tener:

1. ✅ `DATABASE_URL` en `.env`
2. ✅ Archivo `database/schema_postgres.sql` presente
3. ✅ Base de datos PostgreSQL accesible

## 🐛 Troubleshooting

### "Archivo schema_postgres.sql no encontrado"
```bash
# Asegúrate de que existe:
ls backend/database/schema_postgres.sql
```

### "Error al inicializar la base de datos"
Verifica que:
- La conexión a PostgreSQL es válida
- El usuario tiene permisos para crear tablas
- No hay errores de sintaxis en el SQL

### Forzar Re-creación
Si quieres recrear todas las tablas:

```sql
-- Conecta a PostgreSQL y ejecuta:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Luego reinicia el servidor y las creará de nuevo.

## 🎯 Ventajas de Esta Implementación

1. ✅ **Automático:** No necesitas ejecutar scripts SQL manualmente
2. ✅ **Inteligente:** Solo crea si no existen
3. ✅ **Completo:** Crea tablas, vistas, triggers, índices y datos iniciales
4. ✅ **Simple:** Sin ORM pesado, solo SQL puro
5. ✅ **Rápido:** Primera ejecución en segundos

## 📝 Para Detener el Servidor Anterior

Si el puerto 3010 está ocupado:

**Windows PowerShell:**
```powershell
# Ver procesos en puerto 3010
netstat -ano | findstr :3010

# Matar proceso por PID
taskkill /PID <numero_pid> /F

# O matar todos los node.exe
taskkill /F /IM node.exe
```

**Luego iniciar de nuevo:**
```bash
cd backend
npm start
```

---

**¡Ahora funciona como Sequelize!** 🎉

El sistema detecta automáticamente si las tablas existen y las crea en la primera ejecución.
