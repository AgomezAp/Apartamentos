import { Router } from 'express';
import { body } from 'express-validator';
import AuthController from '../controllers/AuthController';
import { handleValidationErrors, authenticate } from '../middleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar un nuevo usuario
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('full_name')
      .notEmpty()
      .withMessage('El nombre completo es requerido')
      .trim(),
    body('phone')
      .optional({ values: 'falsy' })
      .trim(),
    handleValidationErrors,
  ],
  AuthController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida'),
    handleValidationErrors,
  ],
  AuthController.login
);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/profile', authenticate, AuthController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Actualizar perfil del usuario
 * @access  Private
 */
router.put(
  '/profile',
  [
    authenticate,
    body('full_name')
      .optional()
      .notEmpty()
      .withMessage('El nombre completo no puede estar vacío')
      .trim(),
    body('phone')
      .optional({ values: 'falsy' })
      .trim(),
    handleValidationErrors,
  ],
  AuthController.updateProfile
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Cambiar contraseña
 * @access  Private
 */
router.put(
  '/change-password',
  [
    authenticate,
    body('current_password')
      .notEmpty()
      .withMessage('La contraseña actual es requerida'),
    body('new_password')
      .isLength({ min: 6 })
      .withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
    handleValidationErrors,
  ],
  AuthController.changePassword
);



/**
 * @route   GET /api/auth/users
 * @desc    Obtener datos de todos los usuarios
 * @access  Public
 */
router.get('/users', AuthController.getAllUsers);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar enlace de recuperación de contraseña
 * @access  Public
 */
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    handleValidationErrors,
  ],
  AuthController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Restablecer contraseña con token
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Token requerido'),
    body('new_password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    handleValidationErrors,
  ],
  AuthController.resetPassword
);

export default router;
