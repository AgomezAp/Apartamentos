# 🔐 Guía de Inicio Rápido - Sistema de Autenticación

## ⚡ Inicio Rápido

### 1. Verificar que el backend esté corriendo

```bash
cd backend
npm run dev
```

Deberías ver:
```
🔄 Sincronizando modelos de base de datos con Sequelize...
🔄 Verificando conexión PostgreSQL...
🔔 Iniciando servicio de alertas automáticas...
==================================================
🏢 Sistema de Gestión Inmobiliaria
==================================================
🚀 Servidor ejecutándose en http://localhost:3010
```

### 2. Crear primer usuario (si no existe)

**Opción A: Usando Postman/Thunder Client**

```
POST http://localhost:3010/api/auth/register
Content-Type: application/json

{
  "email": "admin@apartamentos.com",
  "password": "admin123",
  "full_name": "Administrador Sistema",
  "phone": "1234567890"
}
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@apartamentos.com",
      "full_name": "Administrador Sistema",
      "phone": "1234567890",
      "is_active": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Opción B: Desde el frontend**

```bash
cd front
ng serve
```

1. Abrir `http://localhost:4200`
2. Hacer clic en "Registrarse" (si existe el link)
3. O navegar a `http://localhost:4200/auth/register`

### 3. Iniciar sesión

**Frontend:**
1. Abrir `http://localhost:4200`
2. Serás redirigido automáticamente a `/auth/login`
3. Ingresar:
   - Email: `admin@apartamentos.com`
   - Password: `admin123`
4. Clic en "Iniciar Sesión"
5. ✅ Serás redirigido al dashboard

**API (Postman):**
```
POST http://localhost:3010/api/auth/login
Content-Type: application/json

{
  "email": "admin@apartamentos.com",
  "password": "admin123"
}
```

Respuesta:
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@apartamentos.com",
      "full_name": "Administrador Sistema",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Copiar el token para usarlo en peticiones posteriores**

### 4. Probar acceso protegido

**Sin token (debe fallar):**
```
GET http://localhost:3010/api/buildings
```

Respuesta:
```json
{
  "success": false,
  "error": "No se proporcionó token de autenticación"
}
```

**Con token (debe funcionar):**
```
GET http://localhost:3010/api/buildings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Respuesta:
```json
{
  "success": true,
  "data": [...]
}
```

---

## 🧪 Pruebas de Seguridad

### Test 1: Acceso sin autenticación
```bash
# Debe ser rechazado
curl http://localhost:3010/api/buildings
```
❌ Esperar: `401 Unauthorized`

### Test 2: Login correcto
```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@apartamentos.com","password":"admin123"}'
```
✅ Esperar: Token JWT

### Test 3: Login con credenciales incorrectas
```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@apartamentos.com","password":"wrongpass"}'
```
❌ Esperar: `401 Unauthorized` - "Credenciales inválidas"

### Test 4: Acceso con token válido
```bash
TOKEN="tu-token-aqui"
curl http://localhost:3010/api/buildings \
  -H "Authorization: Bearer $TOKEN"
```
✅ Esperar: Datos de edificios

### Test 5: Token expirado (después de 24h)
```bash
# Cambiar JWT_EXPIRES_IN=1m en .env para probar rápido
# Esperar 1 minuto
curl http://localhost:3010/api/buildings \
  -H "Authorization: Bearer $TOKEN"
```
❌ Esperar: `401 Unauthorized` - "Token expirado"

---

## 🎯 Comportamiento Esperado

### En el Frontend

| Escenario | Comportamiento |
|-----------|----------------|
| Usuario no autenticado | Redirige a `/auth/login` |
| Login exitoso | Guarda token, redirige a `/dashboard` |
| Token válido | Permite navegación normal |
| Token expirado | Siguiente petición → 401 → logout → redirige a login |
| Cerrar navegador | Token persiste 24h en localStorage |
| Abrir nueva pestaña | Sesión activa si token válido |
| Intentar acceder a ruta protegida sin login | Redirige a login |

### En el Backend

| Escenario | Respuesta |
|-----------|-----------|
| Request sin header Authorization | `401` - No se proporcionó token |
| Token con formato incorrecto | `401` - Formato de token inválido |
| Token expirado | `401` - Token expirado |
| Token con firma inválida | `401` - Token inválido |
| Token válido | Procesa la petición normalmente |
| Rutas `/api/auth/login` y `/api/auth/register` | No requieren token |

---

## 🔍 Inspección del Token

### Ver contenido del token (sin validar)

Ir a: https://jwt.io/

Pegar tu token y verás algo como:

```json
{
  "id": 1,
  "email": "admin@apartamentos.com",
  "full_name": "Administrador Sistema",
  "iat": 1704672000,
  "exp": 1704758400
}
```

- `iat`: Fecha de emisión (timestamp)
- `exp`: Fecha de expiración (timestamp)

Para convertir timestamp a fecha:
```javascript
new Date(1704758400 * 1000) // Fecha legible
```

---

## 🛠️ Troubleshooting

### "Token expirado" constantemente

**Causa:** El reloj del servidor y cliente están desincronizados

**Solución:** 
```bash
# Windows
w32tm /resync

# Linux/Mac
sudo ntpdate -s time.nist.gov
```

### "No se puede conectar al servidor"

**Verificar:**
1. Backend corriendo en puerto 3010
2. CORS configurado correctamente
3. Firewall no bloqueando puerto

### Token no se guarda en localStorage

**Verificar:**
1. Abrir DevTools → Application → Local Storage
2. Buscar clave `auth_token`
3. Si no existe, revisar Console por errores

### Redirige a login después de refrescar página

**Causa:** Token no se está cargando desde localStorage

**Solución:** Verificar `AuthService.checkTokenExpiration()`

---

## 📱 Próximos Pasos

Para mejorar la seguridad (opcional):

1. **Implementar Refresh Tokens**
   - Token de acceso: 15 minutos
   - Token de refresco: 7 días
   - Renovar automáticamente

2. **Rate Limiting**
   - Limitar intentos de login (5 por minuto)
   - Usar express-rate-limit

3. **2FA (Autenticación de dos factores)**
   - OTP por email/SMS
   - Google Authenticator

4. **Auditoría**
   - Registrar todos los login/logout
   - Tabla de sesiones activas

5. **Roles y Permisos**
   - Admin, Usuario, Solo Lectura
   - Middleware de autorización por rol

---

## ✅ Checklist de Implementación

- [x] Backend: Middleware de autenticación JWT
- [x] Backend: Rutas protegidas (excepto auth)
- [x] Backend: Login y registro funcionando
- [x] Backend: Token expira en 24 horas
- [x] Frontend: AuthService implementado
- [x] Frontend: AuthGuard en todas las rutas
- [x] Frontend: AuthInterceptor agrega token
- [x] Frontend: ErrorInterceptor maneja 401
- [x] Frontend: Redirige a login cuando no autenticado
- [x] Frontend: Redirige a login cuando token expira
- [x] .env configurado con JWT_SECRET y JWT_EXPIRES_IN
- [x] Documentación completa

**¡Sistema de autenticación completamente funcional!** 🎉
