import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Crear configuración de multer para diferentes tipos de archivos
 */
const createMulterConfig = (uploadType: 'receipts' | 'contracts' | 'tenant-ids' | 'building-photos' | 'unit-photos') => {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      
      // Crear ruta: uploads/{tipo}/2025/01/
      const uploadPath = path.join(__dirname, `../../uploads/${uploadType}`, String(year), month);
      
      // Crear directorios si no existen
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      // Generar nombre único: file_20250127_143055_abc123.ext
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
      const randomString = Math.random().toString(36).substring(2, 8);
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
      
      cb(null, `${basename}_${timestamp}_${randomString}${ext}`);
    }
  });

  return storage;
};

// Filtro para PDFs y documentos
const documentFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['application/pdf'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se aceptan archivos PDF'));
  }
};

// Filtro para imágenes
const imageFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se aceptan imágenes JPG, PNG o WEBP'));
  }
};

// Filtro para imágenes y PDFs
const imageAndPdfFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se aceptan imágenes (JPG, PNG, WEBP) o PDF'));
  }
};

// Configuraciones de multer por tipo de archivo
export const uploadReceipt = multer({
  storage: createMulterConfig('receipts'),
  fileFilter: imageAndPdfFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export const uploadContract = multer({
  storage: createMulterConfig('contracts'),
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB para contratos
  }
});

export const uploadTenantId = multer({
  storage: createMulterConfig('tenant-ids'),
  fileFilter: imageAndPdfFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export const uploadBuildingPhoto = multer({
  storage: createMulterConfig('building-photos'),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export const uploadUnitPhoto = multer({
  storage: createMulterConfig('unit-photos'),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export const uploadPaymentReceipt = multer({
  storage: createMulterConfig('receipts'),
  fileFilter: documentFilter, // Solo PDF
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});
