# 🚀 Quick Start - Subida de Comprobantes

## Servidor corriendo en: http://localhost:3010

---

## 📤 Subir Comprobante

### En Postman:
1. POST `http://localhost:3010/api/uploads/receipt`
2. Body → **form-data**
3. Campo: `receipt` → Tipo: **File**
4. Seleccionar archivo (PDF, JPG, PNG, GIF - Máx 5MB)
5. Send

**Recibirás:**
```json
{
  "path": "/uploads/receipts/2025/01/comprobante_123456.pdf"
}
```

---

## 💳 Usar en Transacción de Pago

### POST `/api/payments/transactions`
```json
{
  "payment_id": 1,
  "amount": 800000,
  "transaction_date": "2025-01-15",
  "transaction_method_id": 1,
  "reference_number": "TRX-001",
  "receipt_file_path": "/uploads/receipts/2025/01/comprobante_123456.pdf",
  "notes": "Pago mes de enero"
}
```

---

## 📥 Ver/Descargar Comprobante

### En navegador o Postman:
```
GET http://localhost:3010/api/uploads/receipt/2025/01/comprobante_123456.pdf
```

El PDF se abrirá en el navegador o la imagen se mostrará directamente.

---

## ❌ Errores Comunes

| Error | Solución |
|-------|----------|
| `400 - Por favor selecciona un archivo` | No olvidar adjuntar el archivo en Postman |
| `400 - Solo se permiten JPG, PNG, GIF, PDF` | Verificar formato del archivo |
| `413 - Archivo muy grande` | Reducir a menos de 5MB |
| `404 - Archivo no encontrado` | Verificar que la ruta sea correcta |

---

## 📚 Documentación Completa

- [UPLOAD_TESTING_GUIDE.md](./UPLOAD_TESTING_GUIDE.md) - Guía detallada de pruebas
- [POSTMAN_README.md](./POSTMAN_README.md) - Flujo completo de API
- [UPLOAD_IMPLEMENTATION_STATUS.md](./UPLOAD_IMPLEMENTATION_STATUS.md) - Estado de implementación

---

## ✅ Todo Listo

✨ El sistema de subida de comprobantes está **completamente implementado y funcionando**.

**Próximo paso:** Importar la colección de Postman actualizada y hacer una prueba de subida.

🎉 **¡A probar!**
