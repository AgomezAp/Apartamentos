import { Router } from 'express';
import { authenticate } from '../middleware';
import authRoutes from './auth';
import buildingRoutes from './buildings';
import unitRoutes from './units';
import contractRoutes from './contracts';
import paymentRoutes from './payments';
import tenantRoutes from './tenants';
import uploadRoutes from './uploads';
import expenseRoutes from './expenses';
import catalogRoutes from './catalogs';
import dashboardRoutes from './dashboard';
import reportsRoutes from './reports';
import settingsRoutes from './settings';
import maintenanceRoutes from './maintenance';
import alertRoutes from './alerts';
import incomeRoutes from './income';
import unitTypesRoutes from './unitTypes';
import expenseCategoriesRoutes from './expenseCategories';

const router = Router();

// Health check - ruta pública
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API funcionando correctamente' });
});

// Rutas de autenticación - PÚBLICAS (no requieren token)
router.use('/auth', authRoutes);

// Rutas de catálogos - PÚBLICAS (necesarias para formularios)
router.use('/catalogs', catalogRoutes);

// Rutas de categorías de gastos - PÚBLICAS (necesarias para formularios)
router.use('/expense-categories', expenseCategoriesRoutes);

// ========================================
// 🔒 TODAS LAS RUTAS SIGUIENTES ESTÁN PROTEGIDAS
// Requieren autenticación con JWT
// ========================================
router.use(authenticate);

// Rutas de configuración de tipos y categorías
router.use('/unit-types', unitTypesRoutes);

// Rutas principales
router.use('/buildings', buildingRoutes);
router.use('/units', unitRoutes);
router.use('/tenants', tenantRoutes);
router.use('/contracts', contractRoutes);
router.use('/payments', paymentRoutes);
router.use('/uploads', uploadRoutes);
router.use('/maintenance-requests', maintenanceRoutes);
router.use('/expenses', expenseRoutes);
router.use('/alerts', alertRoutes);

// Rutas de reportes y dashboard
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportsRoutes);
router.use('/income', incomeRoutes);

// Rutas de configuración
router.use('/settings', settingsRoutes);

export default router;
