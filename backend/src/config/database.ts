import { Pool } from 'pg';
import dotenv from 'dotenv';
import { initDatabase } from './initDatabase';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno');
}

// Configuración del pool de conexiones PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Función para verificar la conexión
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error);
    return false;
  }
};

// Función para inicializar la base de datos (crear tablas si no existen)
export const DBconnect = async (): Promise<void> => {
  await testConnection();
  await initDatabase(pool);
};

// Función para ejecutar queries con manejo de errores
export const executeQuery = async <T>(
  query: string,
  params?: any[]
): Promise<T> => {
  try {
    const result = await pool.query(query, params);
    return result.rows as T;
  } catch (error) {
    console.error('Error ejecutando query:', error);
    throw error;
  }
};

// Función para ejecutar operaciones UPDATE/DELETE que retorna el número de filas afectadas
export const executeUpdate = async (
  query: string,
  params?: any[]
): Promise<number> => {
  try {
    const result = await pool.query(query, params);
    return result.rowCount || 0;
  } catch (error) {
    console.error('Error ejecutando update:', error);
    throw error;
  }
};

// Función para transacciones
export const transaction = async <T>(
  callback: (client: any) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
