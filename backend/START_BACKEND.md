# 🚀 Guía para Iniciar el Backend

## ⚠️ IMPORTANTE: El error 401 en /api/auth/login

El error que estás viendo **NO es un problema de autorización en el backend**. Las rutas de login y registro son públicas y no requieren autenticación.

### Posibles causas del error 401:

1. **El servidor backend NO está corriendo** (más probable)
2. **El código TypeScript no se ha compilado** después de los cambios
3. **El puerto 3010 está siendo usado por otro proceso**

---

## 📋 Pasos para Iniciar el Backend

### 1️⃣ Abrir terminal en la carpeta backend
```powershell
cd C:\Users\DESARROLLO\Documents\Codigos\apartamentos\backend
```

### 2️⃣ Compilar TypeScript
```powershell
tsc
```

**Resultado esperado:** Se crea/actualiza la carpeta `dist/` con archivos JavaScript compilados.

Si ves errores de compilación, detente aquí y resuelve los errores primero.

### 3️⃣ Crear usuario de prueba (SOLO LA PRIMERA VEZ)
```powershell
npx ts-node src/scripts/createTestUser.ts
```

**Resultado esperado:**
```
✅ Usuario creado exitosamente!
📧 Email: admin@test.com
🔑 Password: admin123
👤 Nombre: Administrador Test
📱 Teléfono: +1234567890
```

Si el usuario ya existe, verás un mensaje de advertencia. Esto es normal.

### 4️⃣ Iniciar el servidor
```powershell
npm run dev
```

**Resultado esperado:**
```
🔄 Sincronizando modelos de base de datos con Sequelize...
🔄 Verificando conexión PostgreSQL...
✅ Conexión exitosa a PostgreSQL
🔔 Iniciando servicio de alertas automáticas...
==================================================
🏢 Sistema de Gestión Inmobiliaria
==================================================
🚀 Servidor ejecutándose en http://localhost:3010
📚 Documentación: http://localhost:3010/api
💊 Health check: http://localhost:3010/api/health
==================================================
```

### 5️⃣ Verificar que el servidor está funcionando

Abre un **segundo terminal** y ejecuta:

```powershell
curl http://localhost:3010/api/health
```

**Resultado esperado:**
```json
{"success":true,"message":"API funcionando correctamente"}
```

Si ves este mensaje, ¡el servidor está funcionando correctamente! 🎉

### 6️⃣ Probar el login

Ahora desde el **frontend** (que debe estar corriendo en `http://localhost:4200`):

1. Ve a la página de login
2. Usa estas credenciales:
   - **Email:** admin@test.com
   - **Password:** admin123

---

## 🔧 Solución de Problemas

### Error: "Cannot find module"
**Solución:** Compila TypeScript nuevamente
```powershell
tsc
```

### Error: "Port 3010 is already in use"
**Solución:** Encuentra y mata el proceso que usa el puerto 3010
```powershell
# Encontrar el proceso
Get-NetTCPConnection -LocalPort 3010 | Select-Object OwningProcess

# Matar el proceso (reemplaza <PID> con el número que obtuviste)
Stop-Process -Id <PID> -Force
```

### Error: "Connection refused" al conectar a PostgreSQL
**Solución:** Verifica las credenciales en el archivo `.env`:
```env
DATABASE_URL=postgres://usuario:contraseña@servidor:5432/nombre_bd
```

### El servidor inicia pero login da 401
**Causas posibles:**
1. No has compilado después de crear AuthController
   ```powershell
   tsc
   npm run dev
   ```

2. El archivo `dist/routes/auth.js` no existe
   ```powershell
   # Verificar si existe
   Test-Path dist/routes/auth.js
   
   # Si no existe, compila
   tsc
   ```

3. Las rutas no se están registrando correctamente
   ```powershell
   # Verifica el archivo dist/routes/index.js
   # Debe contener: router.use('/auth', authRoutes);
   ```

---

## 📝 Verificar Logs del Servidor

Cuando haces login, deberías ver en la consola del backend:

```
2025-12-30T10:30:00.000Z - POST /api/auth/login
```

Si NO ves este log:
- El frontend NO está llegando al backend
- Verifica que el frontend esté configurado para `http://localhost:3010`

Si ves el log pero da 401:
- Revisa el código compilado en `dist/controllers/AuthController.js`
- Asegúrate de que el archivo existe y no tiene errores

---

## 🎯 Comandos Rápidos de Referencia

```powershell
# Compilar
tsc

# Iniciar servidor
npm run dev

# Crear usuario de prueba
npx ts-node src/scripts/createTestUser.ts

# Ver procesos Node
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Verificar puerto 3010
Get-NetTCPConnection -LocalPort 3010

# Health check
curl http://localhost:3010/api/health
```

---

## ✅ Checklist de Verificación

Antes de intentar hacer login, verifica:

- [ ] TypeScript compilado (`tsc` sin errores)
- [ ] Carpeta `dist/` existe y está actualizada
- [ ] Archivo `dist/controllers/AuthController.js` existe
- [ ] Archivo `dist/routes/auth.js` existe
- [ ] Servidor corriendo en puerto 3010
- [ ] Health check responde correctamente
- [ ] Usuario de prueba creado
- [ ] Frontend configurado para `http://localhost:3010`

Si todos estos puntos están verificados y aún da 401, revisa los logs del servidor para ver el error exacto.
