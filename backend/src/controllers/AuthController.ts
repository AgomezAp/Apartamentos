import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel';

/**
 * Controlador de autenticación
 */
class AuthController {
  /**
   * Registrar un nuevo usuario
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, full_name, phone } = req.body;

      // Validar que el email no exista
      const existingUser = await UserModel.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'El email ya está registrado',
        });
        return;
      }

      // Hashear password
      const password_hash = await bcrypt.hash(password, 10);

      // Crear usuario
      const user = await UserModel.create({
        email,
        password_hash,
        full_name,
        phone,
        is_active: true,
      });

      // Generar token JWT
      const jwtSecret = process.env.JWT_SECRET || 'secret-key-default';
      const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
      
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          full_name: user.full_name 
        } as object,
        jwtSecret,
        { expiresIn: jwtExpiresIn } as jwt.SignOptions
      );

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            is_active: user.is_active,
          },
          token,
        },
      });
    } catch (error: any) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        error: 'Error al registrar usuario',
        details: error.message,
      });
    }
  }

  /**
   * Iniciar sesión
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Buscar usuario por email
      const user = await UserModel.findOne({ where: { email } });
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Credenciales inválidas',
        });
        return;
      }

      // Verificar que el usuario esté activo
      if (!user.is_active) {
        res.status(401).json({
          success: false,
          error: 'Usuario inactivo',
        });
        return;
      }

      // Verificar password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Credenciales inválidas',
        });
        return;
      }

      // Actualizar last_login
      await user.update({ last_login: new Date() });

      // Generar token JWT
      const jwtSecret = process.env.JWT_SECRET || 'secret-key-default';
      const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
      
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          full_name: user.full_name 
        } as object,
        jwtSecret,
        { expiresIn: jwtExpiresIn } as jwt.SignOptions
      );

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            is_active: user.is_active,
            last_login: user.last_login,
          },
          token,
        },
      });
    } catch (error: any) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        error: 'Error al iniciar sesión',
        details: error.message,
      });
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'No autenticado',
        });
        return;
      }

      const user = await UserModel.findByPk(userId, {
        attributes: ['id', 'email', 'full_name', 'phone', 'is_active', 'last_login'],
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener perfil',
        details: error.message,
      });
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { full_name, phone } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'No autenticado',
        });
        return;
      }

      const user = await UserModel.findByPk(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
        });
        return;
      }

      await user.update({
        full_name: full_name || user.full_name,
        phone: phone || user.phone,
      });

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          is_active: user.is_active,
        },
      });
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar perfil',
        details: error.message,
      });
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { current_password, new_password } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'No autenticado',
        });
        return;
      }

      const user = await UserModel.findByPk(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
        });
        return;
      }

      // Verificar contraseña actual
      const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
      
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Contraseña actual incorrecta',
        });
        return;
      }

      // Hashear nueva contraseña
      const password_hash = await bcrypt.hash(new_password, 10);

      await user.update({ password_hash });

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente',
      });
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cambiar contraseña',
        details: error.message,
      });
    }
  }
}

export default new AuthController();
