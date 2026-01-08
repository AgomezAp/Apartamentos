import { Router } from 'express';
import CatalogController from '../controllers/CatalogController';

const router = Router();

// ==================== UNIT TYPES ====================
router.get('/unit-types', CatalogController.getUnitTypes);
router.post('/unit-types', CatalogController.createUnitType);
router.put('/unit-types/:id', CatalogController.updateUnitType);
router.delete('/unit-types/:id', CatalogController.deleteUnitType);

// ==================== SERVICE TYPES ====================
router.get('/service-types', CatalogController.getServiceTypes);
router.post('/service-types', CatalogController.createServiceType);
router.put('/service-types/:id', CatalogController.updateServiceType);
router.delete('/service-types/:id', CatalogController.deleteServiceType);

// ==================== PAYMENT STATUSES ====================
router.get('/payment-statuses', CatalogController.getPaymentStatuses);
router.post('/payment-statuses', CatalogController.createPaymentStatus);
router.put('/payment-statuses/:id', CatalogController.updatePaymentStatus);
router.delete('/payment-statuses/:id', CatalogController.deletePaymentStatus);

// ==================== ALERT TYPES ====================
router.get('/alert-types', CatalogController.getAlertTypes);
router.post('/alert-types', CatalogController.createAlertType);
router.put('/alert-types/:id', CatalogController.updateAlertType);
router.delete('/alert-types/:id', CatalogController.deleteAlertType);

// ==================== USERS ====================
router.get('/users', CatalogController.getUsers);
router.post('/users', CatalogController.createUser);
router.put('/users/:id', CatalogController.updateUser);
router.delete('/users/:id', CatalogController.deleteUser);

export default router;
