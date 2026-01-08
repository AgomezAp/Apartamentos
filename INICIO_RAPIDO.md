# 🚀 GUÍA DE INICIO RÁPIDO

## ⚡ Puesta en Marcha en 10 Minutos

### 1️⃣ Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### 2️⃣ Configurar Base de Datos

**Opción A: Usando MySQL Workbench**
1. Abre MySQL Workbench
2. Crea una nueva conexión (localhost:3306)
3. Ejecuta:
```sql
CREATE DATABASE inmobiliaria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
4. Abre el archivo `backend/database/schema.sql`
5. Ejecuta todo el script

**Opción B: Usando línea de comandos**
```bash
# Crear base de datos
mysql -u root -p -e "CREATE DATABASE inmobiliaria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Importar schema
mysql -u root -p inmobiliaria < backend/database/schema.sql
```

### 3️⃣ Configurar Variables de Entorno

```bash
# En la carpeta backend
copy .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_PASSWORD_AQUI
DB_NAME=inmobiliaria
```

### 4️⃣ Iniciar el Servidor

```bash
# Desarrollo (con hot-reload)
npm run dev
```

**¡Listo!** Tu API estará corriendo en `http://localhost:3000`

### 5️⃣ Verificar que Funciona

Abre tu navegador o Postman y visita:
```
http://localhost:3000/api/health
```

Deberías ver:
```json
{
  "success": true,
  "message": "API funcionando correctamente"
}
```

---

## 📝 Primeros Pasos

### Crear tu Primer Edificio

**POST** `http://localhost:3000/api/buildings`

**Body:**
```json
{
  "name": "Edificio Central",
  "address": "Calle 123 #45-67",
  "city": "Bogotá",
  "total_floors": 10,
  "total_units": 40,
  "max_capacity": 40
}
```

### Crear Tipos de Unidad

Los tipos de unidad ya vienen precargados:
- Apartamento
- Apartaestudio
- Local Comercial
- Oficina
- Bodega

Para ver todos:
```sql
SELECT * FROM unit_types;
```

### Crear una Unidad

**POST** `http://localhost:3000/api/units`

**Body:**
```json
{
  "building_id": 1,
  "unit_type_id": 1,
  "unit_number": "101",
  "floor": 1,
  "bedrooms": 3,
  "bathrooms": 2,
  "rental_price": 2000000
}
```

### Crear un Arrendatario

Primero, inserta directamente en la base de datos (el endpoint estará disponible pronto):

```sql
INSERT INTO tenants (document_number, first_name, last_name, email, phone)
VALUES ('123456789', 'Juan', 'Pérez', 'juan@example.com', '3001234567');
```

### Crear un Contrato

**POST** `http://localhost:3000/api/contracts`

**Body:**
```json
{
  "unit_id": 1,
  "tenant_id": 1,
  "contract_number": "CNT-2024-001",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "monthly_rent": 2000000,
  "deposit_amount": 2000000,
  "payment_day": 5,
  "status": "active"
}
```

> 💡 **Tip:** Al crear un contrato con status "active", se generan automáticamente todos los pagos mensuales!

### Ver Pagos Generados

**GET** `http://localhost:3000/api/payments?contract_id=1`

---

## 🔔 Sistema de Alertas

El sistema de alertas se ejecuta automáticamente, pero puedes probarlo manualmente:

### En MySQL:
```sql
-- Ver todas las alertas
SELECT * FROM alerts ORDER BY created_at DESC;

-- Ver alertas pendientes
SELECT * FROM alerts WHERE status = 'pending';
```

### Configurar Email (Opcional)

Edita `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
ALERT_EMAIL_FROM=noreply@inmobiliaria.com
```

Para Gmail, necesitas crear una "App Password":
1. Ve a tu cuenta de Google
2. Seguridad → Contraseñas de aplicaciones
3. Genera una nueva para "Correo"
4. Usa esa contraseña en `SMTP_PASSWORD`

---

## 📊 Ver Reportes

### Unidades Desocupadas
```
GET http://localhost:3000/api/units/vacant
```

### Reporte de Desocupación
```
GET http://localhost:3000/api/units/reports/vacancy
```

### Pagos Vencidos
```
GET http://localhost:3000/api/payments/overdue
```

### Contratos por Vencer
```
GET http://localhost:3000/api/contracts/expiring?days=30
```

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to MySQL"
**Solución:**
1. Verifica que MySQL esté corriendo
2. Confirma usuario y contraseña en `.env`
3. Asegúrate de que la base de datos existe

```bash
# Verificar si MySQL está corriendo (Windows)
sc query MySQL80

# Iniciar MySQL si no está corriendo
net start MySQL80
```

### Error: "Table doesn't exist"
**Solución:** El schema no se importó correctamente
```bash
mysql -u root -p inmobiliaria < backend/database/schema.sql
```

### Puerto 3000 en uso
**Solución:** Cambia el puerto en `.env`
```env
PORT=3001
```

### Las alertas no se envían por email
**Solución:** 
1. Verifica configuración SMTP en `.env`
2. Revisa logs del servidor
3. Prueba con un servicio como Mailtrap para desarrollo

---

## 🧪 Probar con Datos de Ejemplo

### Script SQL para datos de prueba

```sql
-- Insertar edificio
INSERT INTO buildings (name, address, city, total_floors, total_units, max_capacity)
VALUES ('Torre del Norte', 'Av. 100 #15-25', 'Bogotá', 15, 60, 60);

-- Insertar unidades
INSERT INTO units (building_id, unit_type_id, unit_number, floor, rental_price)
VALUES 
(1, 1, '101', 1, 2000000),
(1, 1, '102', 1, 2100000),
(1, 1, '201', 2, 2200000),
(1, 2, '301', 3, 1500000),
(1, 3, 'L-01', 1, 3000000);

-- Insertar arrendatarios
INSERT INTO tenants (document_number, first_name, last_name, email, phone)
VALUES 
('123456789', 'Juan', 'Pérez', 'juan@example.com', '3001111111'),
('987654321', 'María', 'González', 'maria@example.com', '3002222222'),
('456789123', 'Carlos', 'Rodríguez', 'carlos@example.com', '3003333333');

-- Insertar contratos
INSERT INTO contracts (unit_id, tenant_id, start_date, end_date, monthly_rent, deposit_amount, status)
VALUES 
(1, 1, '2024-01-01', '2024-12-31', 2000000, 2000000, 'active'),
(2, 2, '2024-01-15', '2024-07-15', 2100000, 2100000, 'active');
```

---

## 📚 Recursos Adicionales

### Documentación
- [README.md](../README.md) - Visión general del proyecto
- [API_ENDPOINTS.md](backend/docs/API_ENDPOINTS.md) - Documentación completa de la API
- [ARQUITECTURA.md](../ARQUITECTURA.md) - Arquitectura y mejores prácticas
- [ESTRUCTURA_ANGULAR.md](frontend/ESTRUCTURA_ANGULAR.md) - Guía del frontend

### Herramientas Recomendadas
- **Postman**: Para probar la API
- **MySQL Workbench**: Para gestionar la base de datos
- **VS Code**: IDE recomendado
  - Extensiones: ESLint, Prettier, MySQL

### Comandos Útiles

```bash
# Backend
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Producción

# MySQL
mysql -u root -p     # Acceder a MySQL CLI
SHOW DATABASES;      # Ver bases de datos
USE inmobiliaria;    # Seleccionar DB
SHOW TABLES;         # Ver tablas
```

---

## 🎯 Próximos Pasos

1. ✅ Familiarízate con los endpoints de la API
2. ✅ Crea algunos edificios y unidades de prueba
3. ✅ Experimenta con contratos y pagos
4. ✅ Revisa las alertas generadas
5. 📱 Considera crear el frontend Angular
6. 🚀 Personaliza según tus necesidades

---

## 💡 Tips

- Usa **Postman Collections** para guardar tus requests
- Revisa los **logs del servidor** para debugging
- La **documentación de la API** está en `backend/docs/`
- Los **triggers automáticos** manejan estados (ocupado/desocupado, pagado/vencido)
- El sistema de **auditoría** registra todos los cambios importantes

---

## 🆘 ¿Necesitas Ayuda?

1. Revisa la documentación en la carpeta `docs/`
2. Verifica los logs del servidor en la consola
3. Consulta el schema SQL en `backend/database/schema.sql`
4. Abre un issue en el repositorio

---

**¡Ya estás listo para comenzar a gestionar tu negocio inmobiliario! 🏢**
