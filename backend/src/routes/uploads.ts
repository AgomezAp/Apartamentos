import { Router } from 'express';
import UploadController from '../controllers/UploadController';
import { 
  uploadReceipt, 
  uploadContract, 
  uploadTenantId, 
  uploadBuildingPhoto, 
  uploadUnitPhoto 
} from '../config/multer';

const router = Router();

/**
 * Rutas de subida de archivos
 */

// Comprobantes de pago
router.post('/receipt', uploadReceipt.single('receipt'), UploadController.uploadReceipt);

// Documentos de contrato (PDF)
router.post('/contract-document', uploadContract.single('contract'), UploadController.uploadContract);

// Documentos de identidad del inquilino
router.post('/tenant-id', uploadTenantId.single('tenantId'), UploadController.uploadTenantId);

// Fotos de edificio
router.post('/building-photo', uploadBuildingPhoto.single('photo'), UploadController.uploadBuildingPhoto);

// Fotos de unidad
router.post('/unit-photo', uploadUnitPhoto.single('photo'), UploadController.uploadUnitPhoto);

/**
 * Rutas de descarga/visualización de archivos
 */

// Obtener archivo por tipo
router.get('/:type/:year/:month/:filename', UploadController.getFile);

// Mantener ruta legacy para comprobantes (retrocompatibilidad)
router.get('/receipt/:year/:month/:filename', UploadController.getReceipt);

/**
 * Rutas de eliminación de archivos
 */

// Eliminar archivo
router.delete('/:type/:year/:month/:filename', UploadController.deleteFile);

export default router;
