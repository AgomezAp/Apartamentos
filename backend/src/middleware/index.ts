import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import AuditLogModel from '../models/AuditLog';

/**
 * Middleware para registrar cambios en auditoría
 */
export const auditMiddleware = (tableName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Guardar el método original de json
    const originalJson = res.json.bind(res);

    // Sobrescribir el método json para capturar la respuesta
    res.json = function (body: any): Response {
      // Solo auditar operaciones exitosas de CREATE, UPDATE, DELETE
      if (
        body?.success &&
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
      ) {
        const action = getActionFromMethod(req.method);
        const recordId = body.data?.id || req.params.id;

        if (recordId) {
          // Registrar en auditoría de forma asíncrona (no bloquear la respuesta)
          AuditLogModel.create({
            user_id: (req as any).user?.id,
            action,
            table_name: tableName,
            record_id: parseInt(recordId),
            old_values: req.method === 'PUT' || req.method === 'PATCH' ? req.body.oldData : null,
            new_values: body.data,
            ip_address: req.ip || req.socket.remoteAddress,
            user_agent: req.get('user-agent'),
          }).catch((err: any) => {
            console.error('Error registrando auditoría:', err);
          });
        }
      }

      return originalJson(body);
    };

    next();
  };
};

function getActionFromMethod(method: string): string {
  switch (method) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Middleware para manejar errores de validación de express-validator
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error: any) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    res.status(400).json({
      success: false,
      error: 'Errores de validación',
      details: formattedErrors,
    });
    return;
  }
  
  next();
};

/**
 * Middleware para validación de datos
 */
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors,
      });
    }

    return next();
  };
};

/**
 * Middleware para manejo de errores
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  // Error de validación de MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      message: 'El registro ya existe',
    });
  }

  // Error de clave foránea
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      error: 'Foreign key constraint',
      message: 'Referencia inválida a otro registro',
    });
  }

  // Error genérico
  return res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Middleware para paginación
 */
export const paginationMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  (req as any).pagination = {
    page,
    limit,
    offset,
  };

  return next();
};

/**
 * Middleware de autenticación JWT
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No se proporcionó token de autenticación',
      });
    }

    // Verificar formato: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido',
      });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado',
      });
    }

    // Verificar y decodificar token JWT
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret-key-default'
    );

    // Agregar usuario al request
    (req as any).user = decoded;

    return next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Error de autenticación',
      details: error.message,
    });
  }
};
