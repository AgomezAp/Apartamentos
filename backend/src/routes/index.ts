import { Router } from 'express';
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

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API funcionando correctamente' });
});

// Rutas de autenticación (públicas)
router.use('/auth', authRoutes);

// Rutas de catálogos (CREAR PRIMERO)
router.use('/catalogs', catalogRoutes);

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
