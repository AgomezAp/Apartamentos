import { executeQuery } from '../config/database';
import pool from '../config/database';

/**
 * Script para generar contract_number para contratos que no lo tienen
 * Genera números de contrato secuenciales con formato: YYYY-NNNNN
 * Ejemplo: 2025-00001, 2025-00002, etc.
 */
async function generateContractNumbers() {
  console.log('🔄 Iniciando generación de números de contrato...\n');

  try {
    // 1. Obtener contratos sin contract_number
    const contractsWithoutNumber: any[] = await executeQuery(
      `SELECT id, created_at FROM contracts 
       WHERE contract_number IS NULL OR contract_number = '' 
       ORDER BY created_at ASC, id ASC`
    );

    if (contractsWithoutNumber.length === 0) {
      console.log('✅ Todos los contratos ya tienen número asignado');
      return;
    }

    console.log(`📋 Encontrados ${contractsWithoutNumber.length} contratos sin número`);
    console.log(`   Asignando números secuenciales...\n`);

    // 2. Obtener el año actual y el máximo número actual para ese año
    const currentYear = new Date().getFullYear();
    
    // Obtener el máximo número de contrato para el año actual
    const maxNumberQuery: any[] = await executeQuery(
      `SELECT COUNT(*) as count FROM contracts 
       WHERE contract_number IS NOT NULL 
       AND contract_number != ''
       AND EXTRACT(YEAR FROM created_at) = $1`,
      [currentYear]
    );
    
    let nextNumber = (maxNumberQuery[0]?.count || 0) + 1;

    // 3. Asignar números de contrato
    const updates = [];
    
    for (const contract of contractsWithoutNumber) {
      const contractYear = new Date(contract.created_at).getFullYear();
      const contractNumber = `${contractYear}-${String(nextNumber).padStart(5, '0')}`;
      
      updates.push({
        id: contract.id,
        contractNumber
      });
      
      nextNumber++;
    }

    // 4. Actualizar contratos con los números generados
    console.log(`💾 Actualizando ${updates.length} contratos...\n`);
    
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      try {
        await executeQuery(
          `UPDATE contracts SET contract_number = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2`,
          [update.contractNumber, update.id]
        );
        successCount++;
        
        // Mostrar cada 10 actualizaciones
        if (successCount % 10 === 0) {
          console.log(`   ✅ ${successCount}/${updates.length} contratos actualizados...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error actualizando contrato ${update.id}: ${(error as Error).message}`);
      }
    }

    // 5. Verificar que todos tengan número
    const stillMissing: any[] = await executeQuery(
      `SELECT COUNT(*) as count FROM contracts 
       WHERE contract_number IS NULL OR contract_number = ''`
    );

    console.log(`\n✨ Proceso completado:`);
    console.log(`   ✅ Contratos actualizados exitosamente: ${successCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📋 Contratos aún sin número: ${stillMissing[0]?.count || 0}`);

    // 6. Mostrar algunos ejemplos
    const examples: any[] = await executeQuery(
      `SELECT id, contract_number, created_at FROM contracts 
       WHERE contract_number IS NOT NULL 
       ORDER BY created_at DESC LIMIT 5`
    );

    if (examples.length > 0) {
      console.log(`\n📋 Ejemplos de números generados:`);
      for (const ex of examples) {
        console.log(`   • Contrato ID ${ex.id}: ${ex.contract_number}`);
      }
    }

    console.log(`\n✅ Los contratos ahora mostrarán correctamente su número en la lista`);

  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Ejecutar
generateContractNumbers();

