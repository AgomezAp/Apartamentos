# 🏗️ ARQUITECTURA Y MEJORES PRÁCTICAS

## 📐 Visión General de la Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Angular)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Dashboard │  │Buildings │  │Contracts │  │ Reports │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │             │              │             │       │
│       └─────────────┴──────────────┴─────────────┘       │
│                         │                                │
│                   API Service                            │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTP/REST
                          │
┌─────────────────────────▼───────────────────────────────┐
│                   BACKEND (Node.js)                      │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐             │
│  │  Routes  │──│Controllers│──│  Models  │             │
│  └──────────┘  └───────────┘  └────┬─────┘             │
│                                     │                    │
│  ┌──────────────┐  ┌──────────────┐│                    │
│  │  Middleware  │  │   Services   ││                    │
│  │ - Auth       │  │ - Alerts     ││                    │
│  │ - Audit      │  │ - Email      ││                    │
│  └──────────────┘  └──────────────┘│                    │
└─────────────────────────────────────┼────────────────────┘
                                      │
                                      │ MySQL Driver
                                      │
┌─────────────────────────────────────▼────────────────────┐
│                   DATABASE (MySQL)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Buildings │  │  Units   │  │Contracts │  │ Payments│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Tenants  │  │ Expenses │  │ Services │  │ Alerts  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│  ┌──────────────────────────────────────────────────────┐│
│  │              Audit Logs (Trazabilidad)               ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

## 🔧 Patrones de Diseño Implementados

### Backend

#### 1. **MVC (Model-View-Controller)**
```
Routes → Controllers → Models → Database
```
- **Routes**: Definen endpoints y middlewares
- **Controllers**: Lógica de negocio y respuestas
- **Models**: Interacción con la base de datos

#### 2. **Repository Pattern**
Cada modelo encapsula todas las operaciones de base de datos:
```typescript
class BuildingModel {
  async findAll() { /* ... */ }
  async findById(id) { /* ... */ }
  async create(data) { /* ... */ }
  async update(id, data) { /* ... */ }
  async delete(id) { /* ... */ }
}
```

#### 3. **Service Layer**
Servicios especializados para lógica compleja:
```typescript
class AlertService {
  checkExpiringContracts()
  checkOverduePayments()
  sendEmailAlerts()
}
```

#### 4. **Middleware Pattern**
```typescript
router.post('/', 
  authenticate,           // Autenticación
  validateRequest,        // Validación
  auditMiddleware,        // Auditoría
  controller.create       // Acción
);
```

### Frontend

#### 1. **Smart/Dumb Components**
- **Smart Components**: Manejan estado y lógica
- **Dumb Components**: Solo presentación

#### 2. **Service-Based Architecture**
Todos los datos fluyen a través de servicios:
```
Component → Service → API → Backend
```

#### 3. **Reactive Programming (RxJS)**
Uso de Observables para manejo asíncrono:
```typescript
this.buildings$ = this.buildingService.getAll()
  .pipe(
    map(response => response.data),
    catchError(error => of([]))
  );
```

## 📊 Modelo de Datos - Relaciones

```
buildings (1) ──── (N) units
                     │
                     │ (1)
                     │
                     ▼
                  (N) contracts (N) ──── (1) tenants
                     │
                     │ (1)
                     │
                     ▼
                  (N) payments
                     │
                     │ (1)
                     │
                     ▼
                  (N) payment_transactions

units (1) ──── (N) unit_services (N) ──── (1) service_types
units (1) ──── (N) expenses
buildings (1) ──── (N) expenses

* (1) = Uno
* (N) = Muchos
```

## 🔒 Seguridad

### Backend

#### 1. **Validación de Datos**
```typescript
// Validar entrada
const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  // ...
});
```

#### 2. **Prepared Statements**
```typescript
// Siempre usar parámetros
const query = 'SELECT * FROM users WHERE id = ?';
await executeQuery(query, [userId]);
```

#### 3. **Autenticación JWT** (Próxima implementación)
```typescript
// Generar token
const token = jwt.sign({ userId: user.id }, JWT_SECRET);

// Verificar token
const decoded = jwt.verify(token, JWT_SECRET);
```

#### 4. **CORS Configurado**
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

#### 5. **Variables de Entorno**
Nunca exponer credenciales:
```env
DB_PASSWORD=secret123  ✅
JWT_SECRET=super_secret ✅
```

### Frontend

#### 1. **HTTP Interceptor**
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req);
  }
}
```

#### 2. **Route Guards**
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    return this.authService.isAuthenticated();
  }
}
```

## 📈 Escalabilidad

### Horizontal Scaling

#### Database
```sql
-- Índices para mejorar consultas
CREATE INDEX idx_unit_building ON units(building_id);
CREATE INDEX idx_contract_dates ON contracts(start_date, end_date);
CREATE INDEX idx_payment_due ON payments(due_date);

-- Particionamiento (futuro)
PARTITION BY RANGE (YEAR(created_at));
```

#### Backend
- **Load Balancing**: NGINX/Apache
- **Clustering**: PM2 para múltiples instancias
- **Caché**: Redis para datos frecuentes

```bash
# PM2 cluster mode
pm2 start dist/index.js -i max
```

### Vertical Scaling
- Optimización de queries
- Connection pooling
- Lazy loading
- Paginación

## 🔄 CI/CD Pipeline (Recomendado)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Backend Dependencies
        run: cd backend && npm install
      
      - name: Build Backend
        run: cd backend && npm run build
      
      - name: Run Tests
        run: cd backend && npm test
      
      - name: Deploy to Production
        run: |
          # Deploy script
```

## 📊 Monitoreo y Logging

### Application Logging
```typescript
// Winston logger
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Performance Monitoring
```typescript
// Medir tiempo de respuesta
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});
```

### Database Monitoring
```sql
-- Queries lentas
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

## 🧪 Testing Strategy

### Backend

#### Unit Tests
```typescript
describe('BuildingModel', () => {
  it('should create a building', async () => {
    const building = { name: 'Test', address: '123' };
    const id = await BuildingModel.create(building);
    expect(id).toBeGreaterThan(0);
  });
});
```

#### Integration Tests
```typescript
describe('POST /api/buildings', () => {
  it('should return 201', async () => {
    const res = await request(app)
      .post('/api/buildings')
      .send({ name: 'Test', address: '123' });
    expect(res.status).toBe(201);
  });
});
```

### Frontend

#### Component Tests
```typescript
describe('BuildingListComponent', () => {
  it('should render buildings', () => {
    component.buildings = mockBuildings;
    fixture.detectChanges();
    const elements = fixture.debugElement.queryAll(By.css('.building-card'));
    expect(elements.length).toBe(2);
  });
});
```

## 🚀 Optimizaciones

### Backend
```typescript
// Caché en memoria simple
const cache = new Map();

async function getCachedBuildings() {
  if (cache.has('buildings')) {
    return cache.get('buildings');
  }
  const buildings = await BuildingModel.findAll();
  cache.set('buildings', buildings);
  setTimeout(() => cache.delete('buildings'), 60000); // 1 min
  return buildings;
}
```

### Frontend
```typescript
// Lazy loading de módulos
const routes: Routes = [
  {
    path: 'buildings',
    loadChildren: () => import('./modules/buildings/buildings.module')
      .then(m => m.BuildingsModule)
  }
];

// Change detection strategy
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

## 📱 PWA (Progressive Web App)

```bash
# Agregar PWA al proyecto Angular
ng add @angular/pwa

# Genera:
# - manifest.webmanifest
# - service-worker
# - app icons
```

**Beneficios:**
- Funciona offline
- Instalable en dispositivos
- Notificaciones push
- Rendimiento mejorado

## 🔄 Backup y Recuperación

### Database Backup
```bash
# Backup diario automático
0 2 * * * mysqldump -u root -p inmobiliaria > backup_$(date +\%Y\%m\%d).sql

# Restauración
mysql -u root -p inmobiliaria < backup_20241223.sql
```

### Code Repository
```bash
# Git con branches protegidas
main (production)
  ├── develop (staging)
  │    ├── feature/new-reports
  │    └── fix/payment-bug
```

## 📚 Documentación

### Código
```typescript
/**
 * Crea un nuevo edificio en el sistema
 * @param building - Datos del edificio
 * @returns ID del edificio creado
 * @throws DatabaseError si falla la inserción
 */
async create(building: Building): Promise<number> {
  // ...
}
```

### API
- Swagger/OpenAPI (recomendado)
- Postman Collection
- Documentación markdown (ya creada)

## 🎯 Roadmap Futuro

### Fase 1 (Actual) ✅
- Backend REST API
- Base de datos MySQL
- Sistema de alertas
- Auditoría básica

### Fase 2 (3 meses) 🔄
- Frontend Angular completo
- Autenticación JWT
- Dashboard avanzado
- Reportes PDF

### Fase 3 (6 meses) 📅
- App móvil
- Pasarelas de pago
- Firma digital
- BI/Analytics

### Fase 4 (12 meses) 🚀
- Multi-tenant
- API pública
- Marketplace de plugins
- AI/ML predictions

---

**Esta arquitectura está diseñada para:**
- ✅ Crecer con tu negocio
- ✅ Ser mantenible a largo plazo
- ✅ Permitir colaboración en equipo
- ✅ Adaptarse a nuevos requerimientos
