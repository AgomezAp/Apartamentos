/**
 * Script de prueba para verificar sincronización de Sequelize
 * Ejecutar: npx ts-node src/testSequelizeSync.ts
 */

import dotenv from 'dotenv';
import BuildingModel from './models/BuildingModel';
import UnitTypeModel from './models/UnitTypeModel';
import UnitModel from './models/UnitModel';
import TenantModel from './models/TenantModel';
import ContractModel from './models/ContractModel';
import PaymentStatusModel from './models/PaymentStatusModel';
import PaymentModel from './models/PaymentModel';
import UserModel from './models/UserModel';
import AuditLogModel from './models/AuditLog';

// Cargar variables de entorno
dotenv.config();

async function testSync() {
  try {
    console.log('🔄 Iniciando sincronización de modelos Sequelize...');
    console.log(`📍 Base de datos: ${process.env.DATABASE_URL?.split('@')[1]}`);
    
    console.log('  - Sincronizando UserModel...');
    await UserModel.sync();
    
    console.log('  - Sincronizando BuildingModel...');
    await BuildingModel.sync();
    
    console.log('  - Sincronizando UnitTypeModel...');
    await UnitTypeModel.sync();
    
    console.log('  - Sincronizando UnitModel...');
    await UnitModel.sync();
    
    console.log('  - Sincronizando TenantModel...');
    await TenantModel.sync();
    
    console.log('  - Sincronizando ContractModel...');
    await ContractModel.sync();
    
    console.log('  - Sincronizando PaymentStatusModel...');
    await PaymentStatusModel.sync();
    
    console.log('  - Sincronizando PaymentModel...');
    await PaymentModel.sync();
    
    console.log('  - Sincronizando AuditLogModel...');
    await AuditLogModel.sync();
    
    console.log('✅ Sincronización completada exitosamente');
    console.log('📊 Modelos sincronizados: 9 tablas');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    process.exit(1);
  }
}

testSync();
