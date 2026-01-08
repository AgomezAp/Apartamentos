# Rutas de Autenticación - Backend

## ✅ Implementación Completada

Se han agregado las siguientes rutas de autenticación al backend:

### Rutas Públicas (No requieren autenticación)

#### 1. Registro de Usuario
```
POST /api/auth/register
```
**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123",
  "full_name": "Nombre Completo",
  "phone": "+1234567890"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@example.com",
      "full_name": "Nombre Completo",
      "phone": "+1234567890",
      "is_active": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Inicio de Sesión
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@example.com",
      "full_name": "Nombre Completo",
      "phone": "+1234567890",
      "is_active": true,
      "last_login": "2025-12-30T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Rutas Privadas (Requieren autenticación con token JWT)

#### 3. Obtener Perfil
```
GET /api/auth/profile
Headers: Authorization: Bearer <token>
```

#### 4. Actualizar Perfil
```
PUT /api/auth/profile
Headers: Authorization: Bearer <token>
```
**Body:**
```json
{
  "full_name": "Nuevo Nombre",
  "phone": "+0987654321"
}
```

#### 5. Cambiar Contraseña
```
PUT /api/auth/change-password
Headers: Authorization: Bearer <token>
```
**Body:**
```json
{
  "current_password": "contraseña123",
  "new_password": "nuevaContraseña456"
}
```

---

## 🚀 Pasos para Iniciar el Backend

### 1. Compilar TypeScript
```bash
cd backend
tsc
```

### 2. Crear Usuario de Prueba (opcional)
```bash
npx ts-node src/scripts/createTestUser.ts
```
Esto creará un usuario con las siguientes credenciales:
- **Email:** admin@test.com
- **Password:** admin123

### 3. Iniciar el Servidor
```bash
npm run dev
# o
npm start
```

El servidor debería iniciar en: `http://localhost:3010`

### 4. Verificar que el Servidor Esté Funcionando
```bash
curl http://localhost:3010/api/health
```

Deberías ver:
```json
{
  "success": true,
  "message": "API funcionando correctamente"
}
```

---

## 🧪 Probar Login desde el Frontend

Una vez que el servidor backend esté corriendo en `http://localhost:3010`, puedes:

1. Abrir el frontend Angular (normalmente en `http://localhost:4200`)
2. Ir a la página de login
3. Usar las credenciales:
   - **Email:** admin@test.com
   - **Password:** admin123

O crear un nuevo usuario desde la página de registro si está implementada.

---

## 📝 Archivos Creados/Modificados

### Nuevos Archivos
1. `backend/src/controllers/AuthController.ts` - Controlador de autenticación
2. `backend/src/routes/auth.ts` - Rutas de autenticación
3. `backend/src/scripts/createTestUser.ts` - Script para crear usuario de prueba

### Archivos Modificados
1. `backend/src/routes/index.ts` - Se agregó la ruta `/api/auth`
2. `backend/src/middleware/index.ts` - Se mejoró el middleware de autenticación JWT

---

## 🔐 Variables de Entorno

Asegúrate de tener estas variables en tu archivo `.env`:

```env
PORT=3010
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar_en_produccion
JWT_EXPIRES_IN=7d
```

---

## ⚠️ Solución de Problemas

### Error: ERR_CONNECTION_REFUSED
- Verifica que el backend esté corriendo: `npm run dev`
- Verifica que esté en el puerto correcto (3010)
- Revisa los logs de la consola del backend

### Error: 404 Not Found
- Verifica que hayas compilado TypeScript: `tsc`
- Verifica que las rutas estén registradas correctamente
- Revisa que el archivo `dist/routes/auth.js` exista

### Error: Token inválido
- Verifica que el token JWT se esté enviando correctamente
- Verifica que la variable `JWT_SECRET` sea la misma en `.env`
- Verifica que el token no haya expirado

---

## 📦 Dependencias Utilizadas

- `bcrypt` - Hasheo de contraseñas
- `jsonwebtoken` - Generación y validación de tokens JWT
- `express-validator` - Validación de datos de entrada

Todas las dependencias ya están instaladas en el proyecto.
