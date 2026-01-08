import { Request, Response } from 'express';
import ContractModel from '../models/Contract';
import PaymentModel from '../models/Payment';
import { Contract } from '../interfaces';
import NotificationService from '../services/NotificationService';
import BuildingModel from '../models/Building';
import { ContractMapper, PaginationMapper } from '../utils/mappers';
import ContractRepository from '../repositories/ContractRepository';
import UnitRepository from '../repositories/UnitRepository';

class ContractController {
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const filters = {
        status: req.query.status as string,
        unit_id: req.query.unit_id ? parseInt(req.query.unit_id as string) : undefined,
        tenant_id: req.query.tenant_id ? parseInt(req.query.tenant_id as string) : undefined,
      };

      const pagination = (req as any).pagination;
      const contracts = await ContractRepository.findAll(filters, pagination);
      const total = await ContractRepository.count(filters);

      // Normalizar contratos y paginación
      const normalizedContracts = ContractMapper.toDTOList(contracts);
      const normalizedPagination = PaginationMapper.normalize({
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      });

      return res.json({
        success: true,
        data: normalizedContracts,
        pagination: normalizedPagination,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const contract = await ContractRepository.findById(id);

      if (!contract) {
        return res.status(404).json({ success: false, error: 'Contrato no encontrado' });
      }

      // Normalizar contrato
      const normalizedContract = ContractMapper.toDTO(contract);

      return res.json({ success: true, data: normalizedContract });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const contract: Contract = req.body;
      console.log('='.repeat(60));
      console.log('📥 CREATE CONTRATO - Datos recibidos del frontend:');
      console.log(JSON.stringify(contract, null, 2));
      console.log('='.repeat(60));
      
      const id = await ContractModel.create(contract);
      const newContract = await ContractRepository.findById(id);

      // 🏠 Si el contrato está activo, actualizar el estado de la unidad a ocupada
      if (contract.status === 'active' && contract.unit_id) {
        console.log('✅ Contrato activo - Actualizando unidad', contract.unit_id, 'a occupied');
        try {
          const updated = await UnitRepository.updateOccupationStatus(
            contract.unit_id,
            'occupied'
          );
          console.log('📝 Resultado actualización unidad:', updated);
        } catch (unitError) {
          console.error('❌ Error actualizando estado de unidad:', unitError);
        }
      } else {
        console.log('⚠️ No se actualizó la unidad. Status:', contract.status, 'Unit ID:', contract.unit_id);
      }

      // 🔔 Enviar email de bienvenida al inquilino
      if (contract.status === 'active' && (newContract as any).tenant_email) {
        try {
          const building = await BuildingModel.findById((newContract as any).building_id);
          await NotificationService.sendContractWelcome({
            tenantEmail: (newContract as any).tenant_email,
            tenantName: (newContract as any).tenant_name,
            unitNumber: (newContract as any).unit_number,
            buildingName: (newContract as any).building_name,
            buildingAddress: building?.address || 'Dirección no disponible',
            startDate: new Date(contract.start_date).toISOString(),
            endDate: new Date(contract.end_date).toISOString(),
            monthlyRent: contract.monthly_rent,
            paymentDay: contract.payment_day || 1,
            depositAmount: contract.deposit_amount || 0,
          });
        } catch (emailError) {
          console.error('Error enviando email de bienvenida:', emailError);
        }
      }

      // Normalizar contrato creado
      const normalizedContract = newContract ? ContractMapper.toDTO(newContract) : null;

      return res.status(201).json({
        success: true,
        data: normalizedContract,
        message: 'Contrato creado exitosamente'
      });
    } catch (error: any) {
      // Error de foreign key - tenant no existe
      if (error.code === '23503' && error.constraint === 'contracts_tenant_id_fkey') {
        return res.status(400).json({
          success: false,
          error: 'El inquilino especificado no existe. Debe crear el inquilino primero.',
        });
      }
      // Error de foreign key - unit no existe
      if (error.code === '23503' && error.constraint === 'contracts_unit_id_fkey') {
        return res.status(400).json({
          success: false,
          error: 'La unidad especificada no existe.',
        });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const contract: Partial<Contract> = req.body;

      console.log('='.repeat(60));
      console.log('📥 UPDATE CONTRATO - ID:', id);
      console.log('Datos recibidos del frontend:');
      console.log(JSON.stringify(contract, null, 2));
      console.log('='.repeat(60));

      const oldData = await ContractModel.findById(id);
      req.body.oldData = oldData;

      const updated = await ContractModel.update(id, contract);

      if (!updated) {
        return res.status(404).json({ success: false, error: 'Contrato no encontrado' });
      }

      const updatedContract = await ContractRepository.findById(id);

      // 🏠 Si el contrato está activo, actualizar el estado de la unidad a ocupada
      if (updatedContract && updatedContract.status === 'active' && updatedContract.unit_id) {
        console.log('✅ Contrato activo en UPDATE - Actualizando unidad', updatedContract.unit_id, 'a occupied');
        try {
          await UnitRepository.updateOccupationStatus(
            updatedContract.unit_id,
            'occupied'
          );
        } catch (unitError) {
          console.error('❌ Error actualizando estado de unidad en UPDATE:', unitError);
        }
      }

      // Normalizar contrato actualizado
      const normalizedContract = updatedContract ? ContractMapper.toDTO(updatedContract) : null;

      return res.json({
        success: true,
        data: normalizedContract,
        message: 'Contrato actualizado exitosamente',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async finish(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const contract = await ContractModel.findById(id);
      
      if (!contract) {
        return res.status(404).json({ success: false, error: 'Contrato no encontrado' });
      }

      const finished = await ContractModel.finishContract(id);

      if (!finished) {
        return res.status(404).json({ success: false, error: 'Error finalizando contrato' });
      }

      // 🏠 Actualizar el estado de la unidad a disponible (vacant)
      if (contract.unit_id) {
        try {
          await UnitRepository.updateOccupationStatus(
            contract.unit_id,
            'vacant'
          );
        } catch (unitError) {
          console.error('Error actualizando estado de unidad:', unitError);
        }
      }

      // 🔔 Enviar notificación de finalización al inquilino
      if ((contract as any).tenant_email) {
        try {
          // Verificar si hay saldo pendiente
          const overduePayments = await PaymentModel.findAll({
            contract_id: id,
            status: 'overdue',
          });
          const outstandingBalance = overduePayments.reduce((sum, p) => sum + ((p.amount_due || 0) - (p.amount_paid || 0)), 0);

          await NotificationService.sendContractFinished({
            tenantEmail: (contract as any).tenant_email,
            tenantName: (contract as any).tenant_name,
            unitNumber: (contract as any).unit_number,
            buildingName: (contract as any).building_name,
            endDate: new Date(contract.end_date).toISOString(),
            depositAmount: contract.deposit_amount || 0,
            hasOutstandingBalance: outstandingBalance > 0,
            outstandingBalance: outstandingBalance,
          });
        } catch (emailError) {
          console.error('Error enviando email de finalización:', emailError);
        }
      }

      return res.json({
        success: true,
        message: 'Contrato finalizado exitosamente',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getExpiring(req: Request, res: Response): Promise<Response> {
    try {
      const daysAhead = req.query.days ? parseInt(req.query.days as string) : 30;
      const contracts = await ContractModel.findExpiring(daysAhead);

      return res.json({ success: true, data: contracts });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Búsqueda avanzada con filtros múltiples y ordenamiento
   * GET /api/contracts/search?building_id=1&status=active&sortBy=end_date&order=asc
   */
  async search(req: Request, res: Response): Promise<Response> {
    try {
      const filters = {
        building_id: req.query.building_id ? parseInt(req.query.building_id as string) : undefined,
        status: req.query.status as string,
        tenant_id: req.query.tenant_id ? parseInt(req.query.tenant_id as string) : undefined,
        unit_id: req.query.unit_id ? parseInt(req.query.unit_id as string) : undefined,
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
        minRent: req.query.minRent ? parseFloat(req.query.minRent as string) : undefined,
        maxRent: req.query.maxRent ? parseFloat(req.query.maxRent as string) : undefined,
        expiringInDays: req.query.expiringInDays ? parseInt(req.query.expiringInDays as string) : undefined,
        sortBy: req.query.sortBy as string,
        order: req.query.order as 'asc' | 'desc',
      };

      const contracts = await ContractModel.advancedSearch(filters);
      const total = await ContractModel.countAdvancedSearch(filters);

      return res.json({
        success: true,
        data: contracts,
        total,
        filters: filters,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Obtener todos los contratos de un inquilino
   * GET /api/tenants/:id/contracts
   */
  async getByTenantId(req: Request, res: Response): Promise<Response> {
    try {
      const tenantId = parseInt(req.params.id);
      const filters = {
        tenant_id: tenantId,
      };

      const contracts = await ContractRepository.findAll(filters, { page: 1, limit: 100 });

      // Normalizar contratos
      const normalizedContracts = ContractMapper.toDTOList(contracts);

      return res.json({
        success: true,
        data: normalizedContracts,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Obtener el contrato activo de un inquilino
   * GET /api/tenants/:id/contracts/active
   */
  async getActiveTenantContract(req: Request, res: Response): Promise<Response> {
    try {
      const tenantId = parseInt(req.params.id);
      const filters = {
        tenant_id: tenantId,
        status: 'active',
      };

      const contracts = await ContractRepository.findAll(filters, { page: 1, limit: 1 });
      const activeContract = contracts.length > 0 ? contracts[0] : null;

      if (!activeContract) {
        return res.status(404).json({ 
          success: false, 
          error: 'No se encontró contrato activo para este inquilino' 
        });
      }

      // Normalizar contrato
      const normalizedContract = ContractMapper.toDTO(activeContract);

      return res.json({
        success: true,
        data: normalizedContract,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Obtener información de pagos de un contrato
   * GET /api/contracts/:id/payments
   */
  async getPayments(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const { executeQuery } = await import('../config/database');
      
      // Verificar que el contrato existe
      const contractCheck: any[] = await executeQuery(
        `SELECT id FROM contracts WHERE id = $1`,
        [id]
      );
      
      if (contractCheck.length === 0) {
        return res.status(404).json({ success: false, error: 'Contrato no encontrado' });
      }
      
      // Obtener todos los pagos del contrato con sus estados
      const payments: any[] = await executeQuery(
        `SELECT p.*, ps.name as payment_status
         FROM payments p
         INNER JOIN payment_statuses ps ON p.payment_status_id = ps.id
         WHERE p.contract_id = $1
         ORDER BY p.period_year DESC, p.period_month DESC`,
        [id]
      );

      // Calcular estadísticas de pagos
      const totalPayments = payments.length;
      const paidPayments = payments.filter((p: any) => p.payment_status === 'Pagado').length;
      const pendingPayments = payments.filter((p: any) => p.payment_status === 'Pendiente').length;
      const overduePayments = payments.filter((p: any) => p.payment_status === 'Vencido').length;

      // Calcular montos
      const totalAmount = payments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount_due) || 0), 0);
      const paidAmount = payments
        .filter((p: any) => p.payment_status === 'Pagado')
        .reduce((sum: number, p: any) => sum + (parseFloat(p.amount_paid) || 0), 0);
      const pendingAmount = payments
        .filter((p: any) => p.payment_status === 'Pendiente')
        .reduce((sum: number, p: any) => sum + (parseFloat(p.amount_due) || 0), 0);
      const overdueAmount = payments
        .filter((p: any) => p.payment_status === 'Vencido')
        .reduce((sum: number, p: any) => sum + (parseFloat(p.amount_due) || 0), 0);

      return res.json({
        success: true,
        data: {
          contract_id: id,
          total_payments: totalPayments,
          paid_payments: paidPayments,
          pending_payments: pendingPayments,
          overdue_payments: overduePayments,
          total_amount: totalAmount,
          paid_amount: paidAmount,
          pending_amount: pendingAmount,
          overdue_amount: overdueAmount,
          payments: payments
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Eliminar un contrato
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      // Verificar que el contrato existe
      const contract = await ContractRepository.findById(id);
      if (!contract) {
        return res.status(404).json({ success: false, error: 'Contrato no encontrado' });
      }

      // Eliminar el contrato
      const deleted = await ContractRepository.delete(id);

      if (!deleted) {
        return res.status(500).json({ success: false, error: 'No se pudo eliminar el contrato' });
      }

      return res.json({
        success: true,
        message: 'Contrato eliminado exitosamente',
      });
    } catch (error: any) {
      // Manejar errores de foreign key constraint
      if (error.code === '23503') {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar el contrato porque tiene pagos o transacciones asociadas. Finaliza el contrato en su lugar.',
        });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new ContractController();
