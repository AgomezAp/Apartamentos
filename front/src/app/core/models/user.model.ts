/**
 * Modelo de Usuario
 * Interfaces para gestión de usuarios y autenticación
 */

/**
 * Interfaz principal de Usuario
 */
export interface User {
  id?: number;
  email: string;
  full_name: string;
  phone?: string;
  role?: UserRole;
  is_active?: boolean;
  last_login?: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/**
 * Roles de usuario
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
  VIEWER = 'viewer'
}

/**
 * Datos de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Respuesta de login
 */
export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    expiresIn?: number;
  };
  message?: string;
}

/**
 * Datos de registro
 */
export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  phone?: string;
  role_id?: number | null;
}

export interface RoleDTO {
  id: number;
  name: string;
  description?: string;
}

/**
 * Datos de recuperación de contraseña
 */
export interface ForgotPasswordData {
  email: string;
}

/**
 * Datos de restablecimiento de contraseña
 */
export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Datos de cambio de contraseña
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Perfil de usuario (para actualización)
 */
export interface UserProfile {
  full_name?: string;
  phone?: string;
  email?: string;
}

/**
 * Datos almacenados en localStorage/sessionStorage
 */
export interface AuthData {
  user: User;
  token: string;
  expiresAt?: number;
}

/**
 * Estado de autenticación
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}
