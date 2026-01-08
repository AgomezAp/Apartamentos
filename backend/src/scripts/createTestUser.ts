import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import UserModel from '../models/UserModel';
import { DBconnect as DBconnectPg } from '../config/database';
import sequelize from '../config/sequelize';

dotenv.config();

/**
 * Script para crear usuario de prueba
 */
async function createTestUser() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await DBconnectPg();

    console.log('🔄 Creando usuario de prueba...');

    // Verificar si ya existe el usuario
    const existingUser = await UserModel.findOne({
      where: { email: 'admin@test.com' },
    });

    if (existingUser) {
      console.log('⚠️  El usuario admin@test.com ya existe');
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Nombre:', existingUser.full_name);
      return;
    }

    // Crear usuario
    const password = 'admin123';
    const password_hash = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      email: 'admin@test.com',
      password_hash,
      full_name: 'Administrador Test',
      phone: '+1234567890',
      is_active: true,
    });

    console.log('✅ Usuario creado exitosamente!');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password:', password);
    console.log('👤 Nombre:', user.full_name);
    console.log('📱 Teléfono:', user.phone);

  } catch (error: any) {
    console.error('❌ Error al crear usuario:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar script
createTestUser()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
