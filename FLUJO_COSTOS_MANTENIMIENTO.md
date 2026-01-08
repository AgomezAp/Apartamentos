# Flujo de Costos en Mantenimiento

## 📊 Diferencia entre Gasto Estimado y Gasto Real

### 💡 Gasto Estimado (estimated_cost)
**¿Cuándo se ingresa?**
- Al **crear** una nueva solicitud de mantenimiento
- Durante la **edición** de una solicitud pendiente

**¿Para qué sirve?**
- Es una **estimación** de cuánto costará la reparación
- Ayuda a planificar el presupuesto
- Se puede modificar antes de resolver la solicitud

**Ejemplo:**
- Reportas que el aire acondicionado no enfría
- Estimas que la reparación costará $200.000
- Este es el **gasto estimado**

---

### ✅ Gasto Real (actual_cost)
**¿Cuándo se ingresa?**
- Al **resolver** (completar) una solicitud de mantenimiento
- Solo cuando la reparación ya se ha realizado

**¿Dónde se ingresa?**
1. Ir a la lista de mantenimiento
2. Hacer clic en el botón **"✅ Resolver"** en una solicitud "En Progreso"
3. El sistema pregunta:
   - Nombre de quien resolvió
   - **Costo real** ← Aquí se ingresa
   - Notas de resolución
4. Al guardar, el estado cambia a "Completado" y se registra el costo real

**¿Para qué sirve?**
- Registra el **costo real** que tuvo la reparación
- Permite comparar con el estimado
- Genera reportes precisos de gastos

**Ejemplo:**
- La reparación del aire acondicionado se completó
- El técnico cobró $250.000 (diferente al estimado)
- Este es el **gasto real**

---

## 📈 Totales en la Lista de Mantenimiento

En la barra de resumen ahora verás:

- **Total Solicitudes**: Cantidad de solicitudes de mantenimiento
- **Gasto Estimado** (azul): Suma de todos los `estimated_cost`
- **Gasto Real** (verde): Suma de todos los `actual_cost` de solicitudes completadas
- **Página**: Navegación de paginación

---

## 🔄 Flujo Completo

```
1. CREAR SOLICITUD
   ↓
   Ingresar: título, descripción, categoría, prioridad
   Ingresar: GASTO ESTIMADO ($200.000)
   Estado: Pendiente
   
2. ASIGNAR TÉCNICO
   ↓
   Estado: En Progreso
   
3. RESOLVER SOLICITUD
   ↓
   Ingresar: Resuelto por
   Ingresar: GASTO REAL ($250.000) ← Aquí se coloca
   Ingresar: Notas
   Estado: Completado
   
4. VER RESULTADOS
   ↓
   En el detalle se muestran:
   - Gasto Estimado: $200.000
   - Gasto Real: $250.000
   - Diferencia: +$50.000 (costó más de lo estimado)
```

---

## 💰 Ejemplo Práctico

### Solicitud #1: Plomería
- Estimado: $150.000
- Real: $120.000 ✅ (Se ahorró $30.000)

### Solicitud #2: Electricidad
- Estimado: $300.000
- Real: $350.000 ❌ (Costó $50.000 más)

### Solicitud #3: Limpieza
- Estimado: $50.000
- Real: (Aún no resuelta, no tiene gasto real)

**TOTALES:**
- Total Estimado: $500.000
- Total Real: $470.000 (solo suma las completadas)
- Balance: Se ahorró $30.000

---

## 🎯 Resumen

| Campo | Cuándo | Dónde | Propósito |
|-------|--------|-------|-----------|
| **Gasto Estimado** | Al crear/editar | Formulario de solicitud | Planificación |
| **Gasto Real** | Al resolver | Botón "Resolver" | Registro final |

**El gasto real SIEMPRE se ingresa al hacer clic en "✅ Resolver" una solicitud.**
