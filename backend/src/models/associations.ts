import BuildingModel from './BuildingModel';
import UnitModel from './UnitModel';
import UnitTypeModel from './UnitTypeModel';
import TenantModel from './TenantModel';
import ContractModel from './ContractModel';
import PaymentModel from './PaymentModel';
import PaymentStatusModel from './PaymentStatusModel';
import ExpenseModel from './ExpenseModel';
import ExpenseCategoryModel from './ExpenseCategoryModel';
import ServiceTypeModel from './ServiceTypeModel';
import UnitServiceModel from './UnitServiceModel';
import MonthlyServiceModel from './MonthlyServiceModel';
import AlertModel from './AlertModel';
import AlertTypeModel from './AlertTypeModel';
import PaymentTransactionModel from './PaymentTransactionModel';
import AuditLogModel from './AuditLog';
import UserModel from './UserModel';
import BuildingUnitTypeConfigModel from './BuildingUnitTypeConfigModel';
import MaintenanceRequestModel from './MaintenanceRequestModel';

/**
 * Definir todas las asociaciones/relaciones entre modelos
 * 
 * JERARQUÍA DE RELACIONES:
 * 
 * Building (Edificio)
 *   ├─ hasMany → Unit (1 edificio tiene muchas unidades)
 *   ├─ hasMany → Expense (1 edificio tiene muchos gastos)
 *   ├─ hasMany → MonthlyService (1 edificio tiene muchos servicios mensuales)
 *   └─ hasMany → Alert (1 edificio puede tener muchas alertas)
 * 
 * UnitType (Tipo de Unidad)
 *   └─ hasMany → Unit (1 tipo de unidad puede tener muchas unidades)
 * 
 * Unit (Unidad/Apartamento)
 *   ├─ belongsTo → Building (1 unidad pertenece a 1 edificio)
 *   ├─ belongsTo → UnitType (1 unidad pertenece a 1 tipo)
 *   ├─ hasMany → Contract (1 unidad puede tener muchos contratos)
 *   ├─ hasMany → UnitService (1 unidad tiene muchos servicios)
 *   └─ hasMany → Alert (1 unidad puede tener muchas alertas)
 * 
 * Tenant (Inquilino)
 *   └─ hasMany → Contract (1 inquilino puede tener muchos contratos)
 * 
 * Contract (Contrato)
 *   ├─ belongsTo → Unit (1 contrato pertenece a 1 unidad)
 *   ├─ belongsTo → Tenant (1 contrato pertenece a 1 inquilino)
 *   ├─ hasMany → Payment (1 contrato tiene muchos pagos)
 *   └─ hasMany → Alert (1 contrato puede tener muchas alertas)
 * 
 * PaymentStatus (Estado de Pago)
 *   └─ hasMany → Payment (1 estado tiene muchos pagos)
 * 
 * Payment (Pago)
 *   ├─ belongsTo → Contract (1 pago pertenece a 1 contrato)
 *   ├─ belongsTo → PaymentStatus (1 pago tiene 1 estado)
 *   ├─ hasMany → PaymentTransaction (1 pago puede tener muchas transacciones)
 *   └─ hasMany → Alert (1 pago puede tener muchas alertas)
 * 
 * ExpenseCategory (Categoría de Gasto)
 *   └─ hasMany → Expense (1 categoría tiene muchos gastos)
 * 
 * Expense (Gasto)
 *   ├─ belongsTo → Building (1 gasto pertenece a 1 edificio)
 *   ├─ belongsTo → ExpenseCategory (1 gasto pertenece a 1 categoría)
 *   └─ belongsTo → User (1 gasto creado por 1 usuario)
 * 
 * ServiceType (Tipo de Servicio)
 *   ├─ hasMany → UnitService (1 tipo de servicio en muchas unidades)
 *   └─ hasMany → MonthlyService (1 tipo de servicio en muchos registros mensuales)
 * 
 * AlertType (Tipo de Alerta)
 *   └─ hasMany → Alert (1 tipo de alerta tiene muchas alertas)
 * 
 * User (Usuario)
 *   ├─ hasMany → Expense (1 usuario crea muchos gastos)
 *   ├─ hasMany → AuditLog (1 usuario genera muchos logs)
 *   └─ hasMany → Alert (1 usuario resuelve muchas alertas)
 */

export function initializeAssociations(): void {
  // ==================== BUILDING ASSOCIATIONS ====================
  
  // Building hasMany Units
  BuildingModel.hasMany(UnitModel, {
    foreignKey: 'building_id',
    as: 'units',
    onDelete: 'CASCADE',
  });

  // Building hasMany Expenses
  BuildingModel.hasMany(ExpenseModel, {
    foreignKey: 'building_id',
    as: 'expenses',
    onDelete: 'CASCADE',
  });

  // Building hasMany MonthlyServices
  BuildingModel.hasMany(MonthlyServiceModel, {
    foreignKey: 'building_id',
    as: 'monthlyServices',
    onDelete: 'CASCADE',
  });

  // Building hasMany Alerts
  BuildingModel.hasMany(AlertModel, {
    foreignKey: 'building_id',
    as: 'alerts',
    onDelete: 'SET NULL',
  });

  // Building hasMany BuildingUnitTypeConfig
  BuildingModel.hasMany(BuildingUnitTypeConfigModel, {
    foreignKey: 'building_id',
    as: 'unitTypeConfigs',
    onDelete: 'CASCADE',
  });

  // ==================== UNIT TYPE ASSOCIATIONS ====================
  
  // UnitType hasMany Units
  UnitTypeModel.hasMany(UnitModel, {
    foreignKey: 'unit_type_id',
    as: 'units',
    onDelete: 'RESTRICT',
  });

  // UnitType hasMany BuildingUnitTypeConfig
  UnitTypeModel.hasMany(BuildingUnitTypeConfigModel, {
    foreignKey: 'unit_type_id',
    as: 'buildingConfigs',
    onDelete: 'CASCADE',
  });

  // ==================== UNIT ASSOCIATIONS ====================
  
  // Unit belongsTo Building
  UnitModel.belongsTo(BuildingModel, {
    foreignKey: 'building_id',
    as: 'building',
  });

  // Unit belongsTo UnitType
  UnitModel.belongsTo(UnitTypeModel, {
    foreignKey: 'unit_type_id',
    as: 'unitType',
  });

  // Unit hasMany Contracts
  UnitModel.hasMany(ContractModel, {
    foreignKey: 'unit_id',
    as: 'contracts',
    onDelete: 'CASCADE',
  });

  // Unit hasMany UnitServices
  UnitModel.hasMany(UnitServiceModel, {
    foreignKey: 'unit_id',
    as: 'services',
    onDelete: 'CASCADE',
  });

  // Unit hasMany Alerts
  UnitModel.hasMany(AlertModel, {
    foreignKey: 'unit_id',
    as: 'alerts',
    onDelete: 'SET NULL',
  });

  // ==================== TENANT ASSOCIATIONS ====================
  
  // Tenant hasMany Contracts
  TenantModel.hasMany(ContractModel, {
    foreignKey: 'tenant_id',
    as: 'contracts',
    onDelete: 'CASCADE',
  });

  // ==================== CONTRACT ASSOCIATIONS ====================
  
  // Contract belongsTo Unit
  ContractModel.belongsTo(UnitModel, {
    foreignKey: 'unit_id',
    as: 'unit',
  });

  // Contract belongsTo Tenant
  ContractModel.belongsTo(TenantModel, {
    foreignKey: 'tenant_id',
    as: 'tenant',
  });

  // Contract hasMany Payments
  ContractModel.hasMany(PaymentModel, {
    foreignKey: 'contract_id',
    as: 'payments',
    onDelete: 'CASCADE',
  });

  // Contract hasMany Alerts
  ContractModel.hasMany(AlertModel, {
    foreignKey: 'contract_id',
    as: 'alerts',
    onDelete: 'SET NULL',
  });

  // ==================== PAYMENT STATUS ASSOCIATIONS ====================
  
  // PaymentStatus hasMany Payments
  PaymentStatusModel.hasMany(PaymentModel, {
    foreignKey: 'payment_status_id',
    as: 'payments',
    onDelete: 'RESTRICT',
  });

  // ==================== PAYMENT ASSOCIATIONS ====================
  
  // Payment belongsTo Contract
  PaymentModel.belongsTo(ContractModel, {
    foreignKey: 'contract_id',
    as: 'contract',
  });

  // Payment belongsTo PaymentStatus
  PaymentModel.belongsTo(PaymentStatusModel, {
    foreignKey: 'payment_status_id',
    as: 'status',
  });

  // Payment hasMany PaymentTransactions
  PaymentModel.hasMany(PaymentTransactionModel, {
    foreignKey: 'payment_id',
    as: 'transactions',
    onDelete: 'CASCADE',
  });

  // Payment hasMany Alerts
  PaymentModel.hasMany(AlertModel, {
    foreignKey: 'payment_id',
    as: 'alerts',
    onDelete: 'SET NULL',
  });

  // ==================== PAYMENT TRANSACTION ASSOCIATIONS ====================
  
  // PaymentTransaction belongsTo Payment
  PaymentTransactionModel.belongsTo(PaymentModel, {
    foreignKey: 'payment_id',
    as: 'payment',
  });

  // PaymentTransaction belongsTo User (created_by)
  PaymentTransactionModel.belongsTo(UserModel, {
    foreignKey: 'created_by',
    as: 'creator',
  });

  // ==================== EXPENSE CATEGORY ASSOCIATIONS ====================
  
  // ExpenseCategory hasMany Expenses
  ExpenseCategoryModel.hasMany(ExpenseModel, {
    foreignKey: 'category_id',
    as: 'expenses',
    onDelete: 'RESTRICT',
  });

  // ==================== EXPENSE ASSOCIATIONS ====================
  
  // Expense belongsTo Building
  ExpenseModel.belongsTo(BuildingModel, {
    foreignKey: 'building_id',
    as: 'building',
  });

  // Expense belongsTo ExpenseCategory
  ExpenseModel.belongsTo(ExpenseCategoryModel, {
    foreignKey: 'category_id',
    as: 'category',
  });

  // Expense belongsTo User (created_by)
  ExpenseModel.belongsTo(UserModel, {
    foreignKey: 'created_by',
    as: 'creator',
  });

  // ==================== SERVICE TYPE ASSOCIATIONS ====================
  
  // ServiceType hasMany UnitServices
  ServiceTypeModel.hasMany(UnitServiceModel, {
    foreignKey: 'service_type_id',
    as: 'unitServices',
    onDelete: 'CASCADE',
  });

  // ServiceType hasMany MonthlyServices
  ServiceTypeModel.hasMany(MonthlyServiceModel, {
    foreignKey: 'service_type_id',
    as: 'monthlyServices',
    onDelete: 'CASCADE',
  });

  // ==================== UNIT SERVICE ASSOCIATIONS ====================
  
  // UnitService belongsTo Unit
  UnitServiceModel.belongsTo(UnitModel, {
    foreignKey: 'unit_id',
    as: 'unit',
  });

  // UnitService belongsTo ServiceType
  UnitServiceModel.belongsTo(ServiceTypeModel, {
    foreignKey: 'service_type_id',
    as: 'serviceType',
  });

  // ==================== MONTHLY SERVICE ASSOCIATIONS ====================
  
  // MonthlyService belongsTo Building
  MonthlyServiceModel.belongsTo(BuildingModel, {
    foreignKey: 'building_id',
    as: 'building',
  });

  // MonthlyService belongsTo ServiceType
  MonthlyServiceModel.belongsTo(ServiceTypeModel, {
    foreignKey: 'service_type_id',
    as: 'serviceType',
  });

  // ==================== ALERT TYPE ASSOCIATIONS ====================
  
  // AlertType hasMany Alerts
  AlertTypeModel.hasMany(AlertModel, {
    foreignKey: 'alert_type_id',
    as: 'alerts',
    onDelete: 'RESTRICT',
  });

  // ==================== ALERT ASSOCIATIONS ====================
  
  // Alert belongsTo AlertType
  AlertModel.belongsTo(AlertTypeModel, {
    foreignKey: 'alert_type_id',
    as: 'alertType',
  });

  // Alert belongsTo Building (opcional)
  AlertModel.belongsTo(BuildingModel, {
    foreignKey: 'building_id',
    as: 'building',
  });

  // Alert belongsTo Unit (opcional)
  AlertModel.belongsTo(UnitModel, {
    foreignKey: 'unit_id',
    as: 'unit',
  });

  // Alert belongsTo Contract (opcional)
  AlertModel.belongsTo(ContractModel, {
    foreignKey: 'contract_id',
    as: 'contract',
  });

  // Alert belongsTo Payment (opcional)
  AlertModel.belongsTo(PaymentModel, {
    foreignKey: 'payment_id',
    as: 'payment',
  });

  // Alert belongsTo User (resolved_by)
  AlertModel.belongsTo(UserModel, {
    foreignKey: 'resolved_by',
    as: 'resolver',
  });

  // ==================== USER ASSOCIATIONS ====================
  
  // User hasMany Expenses (created_by)
  UserModel.hasMany(ExpenseModel, {
    foreignKey: 'created_by',
    as: 'expenses',
    onDelete: 'SET NULL',
  });

  // User hasMany PaymentTransactions (created_by)
  UserModel.hasMany(PaymentTransactionModel, {
    foreignKey: 'created_by',
    as: 'transactions',
    onDelete: 'SET NULL',
  });

  // User hasMany AuditLogs
  UserModel.hasMany(AuditLogModel, {
    foreignKey: 'user_id',
    as: 'auditLogs',
    onDelete: 'SET NULL',
  });

  // User hasMany Alerts (resolved_by)
  UserModel.hasMany(AlertModel, {
    foreignKey: 'resolved_by',
    as: 'resolvedAlerts',
    onDelete: 'SET NULL',
  });

  // ==================== AUDIT LOG ASSOCIATIONS ====================
  
  // AuditLog belongsTo User
  AuditLogModel.belongsTo(UserModel, {
    foreignKey: 'user_id',
    as: 'user',
  });

  // ==================== BUILDING UNIT TYPE CONFIG ASSOCIATIONS ====================
  
  // BuildingUnitTypeConfig belongsTo Building
  BuildingUnitTypeConfigModel.belongsTo(BuildingModel, {
    foreignKey: 'building_id',
    as: 'building',
  });

  // BuildingUnitTypeConfig belongsTo UnitType
  BuildingUnitTypeConfigModel.belongsTo(UnitTypeModel, {
    foreignKey: 'unit_type_id',
    as: 'unitType',
  });

  // ==================== MAINTENANCE REQUEST ASSOCIATIONS ====================
  
  // MaintenanceRequest belongsTo Unit
  MaintenanceRequestModel.belongsTo(UnitModel, {
    foreignKey: 'unit_id',
    as: 'unit',
  });

  // MaintenanceRequest belongsTo Tenant
  MaintenanceRequestModel.belongsTo(TenantModel, {
    foreignKey: 'tenant_id',
    as: 'tenant',
  });

  // MaintenanceRequest belongsTo User (assigned_to)
  MaintenanceRequestModel.belongsTo(UserModel, {
    foreignKey: 'assigned_to',
    as: 'assignedTo',
  });

  // NOTA: resolved_by ya no es foreign key, es VARCHAR con el nombre del técnico

  // Unit hasMany MaintenanceRequests
  UnitModel.hasMany(MaintenanceRequestModel, {
    foreignKey: 'unit_id',
    as: 'maintenanceRequests',
    onDelete: 'CASCADE',
  });

  // Tenant hasMany MaintenanceRequests
  TenantModel.hasMany(MaintenanceRequestModel, {
    foreignKey: 'tenant_id',
    as: 'maintenanceRequests',
    onDelete: 'CASCADE',
  });

  // User hasMany MaintenanceRequests (assigned_to)
  UserModel.hasMany(MaintenanceRequestModel, {
    foreignKey: 'assigned_to',
    as: 'assignedMaintenanceRequests',
    onDelete: 'SET NULL',
  });

  // NOTA: No hay asociación resolved_by - es texto con nombre del técnico, no FK

  console.log('✅ Asociaciones de modelos inicializadas correctamente');
}

export default initializeAssociations;
