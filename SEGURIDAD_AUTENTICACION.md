# 🔒 Sistema de Autenticación y Seguridad

## Resumen Ejecutivo

Se ha implementado un sistema completo de autenticación JWT que protege TODAS las rutas del sistema excepto las de login y registro. El token expira automáticamente después de 24 horas y redirige al usuario al login.

---

## 🎯 Características Implementadas

### Backend (Express + TypeScript)

✅ **Middleware de autenticación JWT** (`backend/src/middleware/index.ts`)
   - Verifica token en header `Authorization: Bearer <token>`
   - Valida firma y expiración del token
   - Decodifica datos del usuario y los agrega al request

✅ **Rutas protegidas** (`backend/src/routes/index.ts`)
   - Todas las rutas excepto `/api/auth/*` requieren autenticación
   - Middleware `authenticate` aplicado globalmente después de rutas públicas

✅ **Controlador de autenticación** (`backend/src/controllers/AuthController.ts`)
   - Login con email y password
   - Registro de nuevos usuarios
   - Generación de token JWT con expiración de 24 horas
   - Hash de passwords con bcrypt

✅ **Rutas de autenticación** (`backend/src/routes/auth.ts`)
   - `POST /api/auth/login` - Inicio de sesión
   - `POST /api/auth/register` - Registro de usuario
   - `GET /api/auth/profile` - Obtener perfil (protegida)
   - `PUT /api/auth/profile` - Actualizar perfil (protegida)
   - `PUT /api/auth/change-password` - Cambiar contraseña (protegida)

---

### Frontend (Angular 17+)

✅ **Servicio de autenticación** (`front/src/app/core/services/auth.service.ts`)
   - Manejo de login/logout
   - Almacenamiento seguro de token en localStorage
   - Verificación de expiración del token
   - Decodificación de token JWT
   - Observable para estado de autenticación

✅ **Guard de rutas** (`front/src/app/core/guards/auth.guard.ts`)
   - Protege todas las rutas que requieren autenticación
   - Redirige a `/auth/login` si no está autenticado
   - Guarda URL de retorno para redirigir después del login

✅ **Interceptor de autenticación** (`front/src/app/core/interceptors/auth.interceptor.ts`)
   - Agrega automáticamente el token JWT a todas las peticiones HTTP
   - Excluye rutas públicas (login, register)
   - Header: `Authorization: Bearer <token>`

✅ **Interceptor de errores** (`front/src/app/core/interceptors/error.interceptor.ts`)
   - Detecta error 401 (token expirado o inválido)
   - Llama a `authService.logout()` automáticamente
   - Redirige al login
   - Muestra notificaciones de error

✅ **Rutas protegidas** (`front/src/app/app.routes.ts`)
   - Todas las rutas excepto `/auth/*` tienen `canActivate: [authGuard]`
   - Ruta raíz redirige a `/dashboard` (protegido)
   - Ruta 404 redirige a `/auth/login`

---

## 🔐 Flujo de Autenticación

### 1. Login
```
Usuario → Login Component → AuthService.login() 
  → POST /api/auth/login → Backend valida credenciales
  → Backend genera JWT (exp: 24h) → Frontend guarda token
  → Redirige a dashboard
```

### 2. Acceso a Ruta Protegida
```
Usuario navega → AuthGuard verifica token
  → Si válido: permite acceso
  → Si inválido/expirado: redirige a /auth/login
```

### 3. Petición HTTP
```
Componente → HttpClient → AuthInterceptor agrega header
  → Request con Bearer token → Backend valida token
  → Si válido: procesa request
  → Si inválido: 401 → ErrorInterceptor → logout + redirect
```

### 4. Token Expirado
```
Token expira (24h) → Siguiente petición → Backend 401
  → ErrorInterceptor detecta → AuthService.logout()
  → Limpia localStorage → Redirige a login
  → Usuario debe iniciar sesión nuevamente
```

---

## 📋 Endpoints del Backend

### Públicos (No requieren token)
- `GET /` - Información de la API
- `GET /api/health` - Health check
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Protegidos (Requieren token JWT)
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/change-password` - Cambiar contraseña
- `GET /api/buildings` - Listar edificios
- `POST /api/buildings` - Crear edificio
- `GET /api/units` - Listar unidades
- `POST /api/payments` - Registrar pago
- ... (todas las demás rutas)

---

## 🛡️ Seguridad Implementada

### Backend
1. **Tokens JWT firmados** con secret key (configurable en `.env`)
2. **Expiración automática** de tokens (24 horas)
3. **Passwords hasheados** con bcrypt (10 rounds)
4. **Validación de entrada** con express-validator
5. **Middleware de autenticación** aplicado globalmente
6. **Verificación de usuario activo** en login

### Frontend
1. **Guards en todas las rutas** protegidas
2. **Token en header** de todas las peticiones
3. **Verificación de expiración** del token localmente
4. **Logout automático** cuando token expira
5. **Redirección automática** a login cuando no autenticado
6. **Almacenamiento seguro** en localStorage
7. **Limpieza de datos** en logout

---

## 🔧 Configuración

### Variables de Entorno (Backend)

Archivo: `backend/.env`

```env
# JWT Configuration
JWT_SECRET=tu-clave-secreta-super-segura-cambiar-en-produccion
JWT_EXPIRES_IN=24h

# Otros...
PORT=3010
```

### Configuración del Frontend

Archivo: `front/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3010/api'
};
```

---

## 📝 Cómo Usar

### Iniciar sesión desde el frontend

1. Navegar a `http://localhost:4200`
2. Será redirigido automáticamente a `/auth/login`
3. Ingresar credenciales (email y password)
4. Si exitoso, redirige a `/dashboard`
5. Token se guarda automáticamente en localStorage

### Crear primer usuario (Backend)

Si no hay usuarios en la base de datos:

```bash
# Opción 1: Usando Postman/Thunder Client
POST http://localhost:3010/api/auth/register
Content-Type: application/json

{
  "email": "admin@apartamentos.com",
  "password": "admin123",
  "full_name": "Administrador",
  "phone": "1234567890"
}
```

```bash
# Opción 2: Insertar directamente en PostgreSQL
INSERT INTO users (email, password_hash, full_name, is_active) 
VALUES (
  'admin@apartamentos.com',
  '$2b$10$...',  -- Hash de bcrypt para 'admin123'
  'Administrador',
  true
);
```

---

## 🧪 Pruebas

### Probar autenticación

1. **Sin token**: Intentar acceder a `http://localhost:3010/api/buildings`
   - ❌ Debe retornar: `401 Unauthorized` - "No se proporcionó token de autenticación"

2. **Con token válido**: 
   ```bash
   GET http://localhost:3010/api/buildings
   Authorization: Bearer <tu-token-jwt>
   ```
   - ✅ Debe retornar: Lista de edificios

3. **Token expirado**: Esperar 24 horas o cambiar `JWT_EXPIRES_IN=1m`
   - ❌ Debe retornar: `401 Unauthorized` - "Token expirado"

### Probar frontend

1. Abrir navegador sin estar logueado
2. Intentar acceder a `http://localhost:4200/dashboard`
   - ✅ Debe redirigir a `/auth/login`

3. Hacer login
   - ✅ Debe guardar token en localStorage
   - ✅ Debe redirigir a dashboard

4. Cerrar navegador y volver a abrir
   - ✅ Debe mantener sesión activa (mientras token sea válido)

5. Borrar token de localStorage o esperar 24h
   - ✅ Debe redirigir a login en la siguiente petición

---

## 🚨 Importante

### En Producción

1. **Cambiar JWT_SECRET** a un valor aleatorio y seguro
2. **Usar HTTPS** para todas las peticiones
3. **Configurar CORS** correctamente
4. **Habilitar rate limiting** para evitar fuerza bruta
5. **Configurar headers de seguridad** (helmet.js)
6. **Revisar logs** de intentos de acceso no autorizados

### Buenas Prácticas

1. **No compartir tokens** entre usuarios
2. **No almacenar información sensible** en el token
3. **Rotar secretos** periódicamente
4. **Implementar refresh tokens** para sesiones largas
5. **Auditar accesos** a recursos críticos

---

## 📊 Estado Actual

| Componente | Estado | Descripción |
|-----------|---------|-------------|
| Backend - Middleware Auth | ✅ | Funcionando |
| Backend - Rutas Protegidas | ✅ | Todas protegidas excepto auth |
| Backend - Login/Register | ✅ | Funcionando |
| Frontend - AuthService | ✅ | Funcionando |
| Frontend - AuthGuard | ✅ | Aplicado a todas las rutas |
| Frontend - AuthInterceptor | ✅ | Agrega token automáticamente |
| Frontend - ErrorInterceptor | ✅ | Maneja 401 y redirige |
| Token Expiration | ✅ | 24 horas configurado |
| Auto-redirect on expire | ✅ | Funcionando |

---

## 🎓 Resultado

**El sistema ahora está completamente protegido:**

- ✅ Solo usuarios autenticados pueden acceder a las rutas
- ✅ Tokens expiran automáticamente después de 24 horas
- ✅ Usuarios son redirigidos al login cuando:
  - No tienen token
  - Token ha expirado
  - Token es inválido
- ✅ No se pueden hacer modificaciones sin autenticación
- ✅ Todas las peticiones incluyen el token automáticamente

**Nadie puede acceder o modificar datos sin iniciar sesión correctamente.**
