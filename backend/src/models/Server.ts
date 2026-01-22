import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DBconnect as DBconnectPg } from '../config/database';
import { errorHandler } from '../middleware';
import routes from '../routes';
import alertService from '../services/alertService';
import initializeAssociations from './associations';
import BuildingModel from './BuildingModel';
import UnitTypeModel from './UnitTypeModel';
import UnitModel from './UnitModel';
import TenantModel from './TenantModel';
import ContractModel from './ContractModel';
import PaymentStatusModel from './PaymentStatusModel';
import PaymentModel from './PaymentModel';
import PaymentReceiptModel from './PaymentReceiptModel';
import UserModel from './UserModel';
import AuditLogModel from './AuditLog';
import ServiceTypeModel from './ServiceTypeModel';
import RoleModel from './RoleModel';
import ExpenseCategoryModel from './ExpenseCategoryModel';
import AlertTypeModel from './AlertTypeModel';
import AlertModel from './AlertModel';
import SystemSettingModel from './SystemSettingModel';
import PaymentTransactionModel from './PaymentTransactionModel';
import ExpenseModel from './ExpenseModel';
import UnitServiceModel from './UnitServiceModel';
import MonthlyServiceModel from './MonthlyServiceModel';
import BuildingUnitTypeConfigModel from './BuildingUnitTypeConfigModel';
import MaintenanceRequestModel from './MaintenanceRequestModel';

// Cargar variables de entorno
dotenv.config();

/**
 * Clase principal del servidor
 */
class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandlers();
  }

  /**
   * Configurar middlewares globales
   */
  private configureMiddlewares(): void {
    // CORS - opciones explícitas para permitir preflight y métodos necesarios
    const corsOptions = {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
      exposedHeaders: ['Content-Range', 'X-Total-Count'],
      optionsSuccessStatus: 204,
    } as any;

    this.app.use(cors(corsOptions));
    // Asegurar manejo de preflight (OPTIONS) para todas las rutas
    this.app.options('*', cors(corsOptions));

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging básico
    this.app.use((req, _res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Configurar rutas de la aplicación
   */
  private configureRoutes(): void {
    // Ruta raíz
    this.app.get('/', (_req, res) => {
      res.json({
        success: true,
        message: 'Sistema de Gestión Inmobiliaria - API REST',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          buildings: '/api/buildings',
          units: '/api/units',
          contracts: '/api/contracts',
          payments: '/api/payments',
        },
      });
    });

    // Rutas de la API
    this.app.use('/api', routes);
  }

  /**
   * Conectar a la base de datos y sincronizar modelos (crear/actualizar tablas)
   */
  async DBconnect(): Promise<void> {
    try {
      console.log('🔄 Sincronizando modelos de base de datos con Sequelize...');
      
      // Inicializar asociaciones ANTES de sincronizar
      initializeAssociations();
      
      // Sincronizar modelos de Sequelize (verificar/crear tablas, sin modificar estructura)
      // Tablas base y catálogos
      await RoleModel.sync({alter: true});
      await UserModel.sync({alter: true});
      await ServiceTypeModel.sync({alter: true});
      await ExpenseCategoryModel.sync({alter: true});
      await PaymentStatusModel.sync({alter: true});
      await AlertTypeModel.sync({alter: true});
      await UnitTypeModel.sync({alter: true});
      
      // Tablas principales
      await BuildingModel.sync({alter: true});
      await BuildingUnitTypeConfigModel.sync({alter: true});
      await UnitModel.sync({alter: true});
      await UnitServiceModel.sync({alter: true});
      await TenantModel.sync({alter: true});
      await ContractModel.sync({alter: true});
      await MaintenanceRequestModel.sync({alter: true});
      
      // Tablas de pagos y transacciones
      await PaymentModel.sync({alter: true});
      await PaymentReceiptModel.sync({alter: true});
      await PaymentTransactionModel.sync({alter: true});
      
      // Tablas de gastos y servicios
      await ExpenseModel.sync({alter: true});
      await MonthlyServiceModel.sync({alter: true});
      
      // Tablas de sistema
      await AlertModel.sync({alter: true});
      await AuditLogModel.sync({alter: true});
      await SystemSettingModel.sync({alter: true});

      // Sembrar roles por defecto si no existen
      try {
        const defaultRoles = [
          { name: 'admin', description: 'Administrador con todos los permisos' },
          { name: 'manager', description: 'Usuario con permisos de gestión' },
          { name: 'reader', description: 'Usuario con permisos solo lectura' },
        ];

        for (const r of defaultRoles) {
          await RoleModel.findOrCreate({ where: { name: r.name }, defaults: { description: r.description } });
        }
      } catch (seedErr) {
        console.error('Error sembrando roles por defecto:', seedErr);
      }
      
    } catch (error) {
      console.error('❌ Error sincronizando modelos:', error);
      throw error;
    }
  }

  /**
   * Configurar manejadores de errores
   */
  private configureErrorHandlers(): void {
    // Manejo de rutas no encontradas
    this.app.use((_req, res) => {
      res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
      });
    });

    // Manejo global de errores
    this.app.use(errorHandler);
  }

  /**
   * Iniciar el servidor
   */
  async start(): Promise<void> {
    try {
      // 1. Conectar y sincronizar modelos de base de datos con Sequelize
      await this.DBconnect();

      // 2. Conectar con pg (para el sistema actual que usa queries directos)
      console.log('🔄 Verificando conexión PostgreSQL...');
      await DBconnectPg();

      // 3. Iniciar servicio de alertas automáticas
      console.log('🔔 Iniciando servicio de alertas automáticas...');
      alertService.start();

      // 4. Iniciar servidor HTTP
      this.app.listen(this.port, () => {
        console.log('='.repeat(50));
        console.log('🏢 Sistema de Gestión Inmobiliaria');
        console.log('='.repeat(50));
        console.log(`🚀 Servidor ejecutándose en http://localhost:${this.port}`);
        console.log(`📚 Documentación: http://localhost:${this.port}/api`);
        console.log(`💊 Health check: http://localhost:${this.port}/api/health`);
        console.log('='.repeat(50));
      });

    } catch (error) {
      console.error('❌ Error iniciando el servidor:', error);
      process.exit(1);
    }
  }

  /**
   * Obtener la instancia de Express
   */
  getApp(): Application {
    return this.app;
  }
}

export default Server;
