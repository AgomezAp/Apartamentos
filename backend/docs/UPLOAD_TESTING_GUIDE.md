# Guía de Pruebas - Sistema de Subida de Comprobantes

## 📋 Resumen

Sistema completo de subida de archivos para comprobantes de pago implementado con multer.

**Endpoints disponibles:**
- `POST /api/uploads/receipt` - Sube un comprobante
- `GET /api/uploads/receipt/:year/:month/:filename` - Descarga/visualiza un comprobante

**Características:**
- ✅ Formatos permitidos: JPG, JPEG, PNG, GIF, PDF
- ✅ Tamaño máximo: 5 MB
- ✅ Organización automática por año/mes
- ✅ Nombres únicos (timestamp + random)
- ✅ Validación de tipo de archivo
- ✅ Manejo de errores completo

---

## 🧪 Prueba 1: Subir Comprobante

### Usando Postman

1. **Abre Postman** e importa la colección actualizada `Apartamentos_API.postman_collection.json`

2. **Selecciona** el request `Uploads > Subir comprobante de pago`

3. **En la pestaña Body:**
   - Selecciona `form-data`
   - Agrega un campo llamado `receipt`
   - Cambia el tipo a `File` (desplegable a la derecha)
   - Haz clic en `Select Files` y elige un archivo (JPG, PNG, GIF o PDF)

4. **Envía** el request

**Respuesta esperada (200):**
```json
{
  "success": true,
  "message": "Archivo subido exitosamente",
  "data": {
    "filename": "comprobante_20250127_143055_abc123.pdf",
    "originalName": "transferencia-enero.pdf",
    "mimetype": "application/pdf",
    "size": 245678,
    "path": "/uploads/receipts/2025/01/comprobante_20250127_143055_abc123.pdf",
    "uploadedAt": "2025-01-27T14:30:55.123Z"
  }
}
```

**⚠️ Errores comunes:**

| Error | Causa | Solución |
|-------|-------|----------|
| `400 - Por favor selecciona un archivo` | No se adjuntó archivo | Verificar que el campo `receipt` tenga un archivo |
| `400 - Solo se permiten archivos JPG, PNG, GIF y PDF` | Formato inválido | Usar solo formatos permitidos |
| `413 - Archivo muy grande` | Archivo > 5MB | Reducir tamaño del archivo |

---

## 🧪 Prueba 2: Usar Comprobante en Transacción de Pago

### Paso 1: Subir el comprobante (ver Prueba 1)

### Paso 2: Copiar la ruta retornada

De la respuesta anterior, copia el valor de `data.path`:
```
/uploads/receipts/2025/01/comprobante_20250127_143055_abc123.pdf
```

### Paso 3: Crear transacción de pago con comprobante

**Request:** `POST /api/payments/transactions`

**Body:**
```json
{
  "payment_id": 1,
  "amount": 800000,
  "transaction_date": "2025-01-15",
  "transaction_method_id": 1,
  "reference_number": "TRANS-001",
  "receipt_file_path": "/uploads/receipts/2025/01/comprobante_20250127_143055_abc123.pdf",
  "notes": "Transferencia Bancolombia - Enero 2025"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Transacción registrada exitosamente",
  "data": {
    "id": 1,
    "payment_id": 1,
    "amount": 800000,
    "transaction_date": "2025-01-15T00:00:00.000Z",
    "transaction_method_id": 1,
    "reference_number": "TRANS-001",
    "receipt_file_path": "/uploads/receipts/2025/01/comprobante_20250127_143055_abc123.pdf",
    "notes": "Transferencia Bancolombia - Enero 2025",
    "created_at": "2025-01-27T14:35:00.000Z"
  }
}
```

---

## 🧪 Prueba 3: Descargar/Ver Comprobante

### Usando Postman

1. **Selecciona** el request `Uploads > Ver/Descargar comprobante`

2. **Modifica la URL** con la ruta real:
   ```
   http://localhost:3010/api/uploads/receipt/2025/01/comprobante_20250127_143055_abc123.pdf
   ```

3. **Envía** el request

4. **El archivo se mostrará** en Postman o se descargará

### Usando el navegador

Simplemente abre en el navegador:
```
http://localhost:3010/api/uploads/receipt/2025/01/comprobante_20250127_143055_abc123.pdf
```

**PDFs:** Se abrirán en el visor del navegador  
**Imágenes:** Se mostrarán directamente  

---

## 🧪 Prueba 4: Flujo Completo con cURL

### 1. Subir comprobante
```bash
curl -X POST http://localhost:3010/api/uploads/receipt \
  -F "receipt=@C:/ruta/al/archivo/comprobante.pdf"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "path": "/uploads/receipts/2025/01/comprobante_20250127_143055_abc123.pdf"
  }
}
```

### 2. Crear transacción con la ruta
```bash
curl -X POST http://localhost:3010/api/payments/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": 1,
    "amount": 800000,
    "transaction_date": "2025-01-15",
    "transaction_method_id": 1,
    "reference_number": "TRANS-001",
    "receipt_file_path": "/uploads/receipts/2025/01/comprobante_20250127_143055_abc123.pdf"
  }'
```

### 3. Descargar comprobante
```bash
curl -O http://localhost:3010/api/uploads/receipt/2025/01/comprobante_20250127_143055_abc123.pdf
```

---

## 📂 Estructura de Archivos Generada

Después de subir varios comprobantes:

```
backend/
├── uploads/
│   └── receipts/
│       ├── 2024/
│       │   ├── 12/
│       │   │   ├── comprobante_20241215_103045_xyz789.pdf
│       │   │   └── comprobante_20241220_154530_abc123.jpg
│       └── 2025/
│           ├── 01/
│           │   ├── comprobante_20250105_091520_def456.pdf
│           │   ├── comprobante_20250115_143055_ghi789.png
│           │   └── comprobante_20250127_170025_jkl012.pdf
│           └── 02/
│               └── comprobante_20250201_100000_mno345.pdf
```

---

## 🛠️ Verificación de la Base de Datos

### Consultar transacciones con comprobantes

```sql
SELECT 
  pt.id,
  pt.payment_id,
  pt.amount,
  pt.transaction_date,
  pt.receipt_file_path,
  pt.notes,
  p.unit_id,
  p.due_date
FROM payment_transactions pt
JOIN payments p ON pt.payment_id = p.id
WHERE pt.receipt_file_path IS NOT NULL
ORDER BY pt.transaction_date DESC;
```

### Verificar archivos huérfanos

```sql
-- Listar todas las rutas de archivos registradas
SELECT DISTINCT receipt_file_path 
FROM payment_transactions 
WHERE receipt_file_path IS NOT NULL;
```

Luego verificar manualmente que esos archivos existen en `backend/uploads/receipts/...`

---

## ⚙️ Configuración Actual

**Archivo:** `src/config/multer.ts`

```typescript
// Formatos permitidos
const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/pdf'
];

// Tamaño máximo: 5MB
limits: { fileSize: 5 * 1024 * 1024 }

// Carpeta de destino
uploads/receipts/{año}/{mes}/

// Formato de nombre
{basename}_{timestamp}_{random}.{ext}
```

---

## 🔧 Troubleshooting

### Error: "Cannot POST /api/uploads/receipt"

**Causa:** El servidor no tiene las rutas cargadas  
**Solución:** Reiniciar el servidor (`npm start`)

### Error: Archivo subido pero no se encuentra en disco

**Causa:** Permisos de escritura en carpeta uploads  
**Solución:** 
```bash
chmod -R 755 uploads/receipts
```

### Error: "Archivo muy grande" pero el archivo es pequeño

**Causa:** Límite de Express body-parser  
**Solución:** Ya está configurado en multer, revisar que no haya otro middleware limitando

### Los archivos no se están organizando por año/mes

**Causa:** Error en la generación de rutas  
**Solución:** Revisar logs del servidor, debería crear carpetas automáticamente

---

## ✅ Checklist de Validación

Usa este checklist para validar que todo funciona:

- [ ] Subir archivo PDF < 5MB → Success
- [ ] Subir archivo JPG < 5MB → Success
- [ ] Subir archivo > 5MB → Error 413
- [ ] Subir archivo .docx → Error 400 (formato no permitido)
- [ ] Request sin archivo → Error 400
- [ ] Archivo se guarda en carpeta año/mes correcta
- [ ] Nombre de archivo es único (timestamp + random)
- [ ] Crear transacción con receipt_file_path → Success
- [ ] Descargar archivo vía GET → Archivo se descarga
- [ ] Ver PDF en navegador → Se abre en visor
- [ ] Ver imagen en navegador → Se muestra
- [ ] Solicitar archivo inexistente → Error 404

---

## 📝 Ejemplos de Casos de Uso

### Caso 1: Apartamento de 4 meses

1. Crear contrato de 4 meses (genera 4 pagos)
2. Inquilino paga mes 1 por transferencia
3. **Subir comprobante** → Obtener ruta
4. **Registrar transacción** con la ruta del comprobante
5. Sistema actualiza `amount_paid` y `payment_status_id` automáticamente
6. Administrador puede **descargar comprobante** cuando lo necesite

### Caso 2: Múltiples pagos parciales

1. Pago pendiente: $800,000
2. Inquilino paga $400,000 → **Subir comprobante1** → Transacción 1
3. Inquilino paga $400,000 → **Subir comprobante2** → Transacción 2
4. Sistema suma ambas transacciones: $800,000 total
5. Pago cambia a COMPLETADO
6. Administrador tiene **2 comprobantes** archivados

---

## 🎯 Próximos Pasos Sugeridos

1. ✅ Sistema de subida funcionando
2. ⏳ Agregar autenticación JWT a los endpoints de upload
3. ⏳ Implementar soft-delete de archivos cuando se elimina transacción
4. ⏳ Crear endpoint para listar todos los comprobantes de un pago
5. ⏳ Agregar compresión de imágenes antes de guardar
6. ⏳ Implementar límite de tamaño por usuario/mes
7. ⏳ Crear worker para eliminar archivos huérfanos

---

## 📞 Soporte

Si encuentras problemas:

1. Revisar logs del servidor en consola
2. Verificar permisos de carpeta `uploads/`
3. Comprobar que multer está instalado: `npm list multer`
4. Verificar que las rutas están registradas: buscar "uploads/receipt" en logs de inicio del servidor

**Estado actual:** ✅ Sistema completamente funcional y probado
