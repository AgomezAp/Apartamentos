import ExcelJS from 'exceljs';
import { Response } from 'express';

/**
 * Servicio para generación de Excel
 */
class ExcelService {
  /**
   * Genera Excel de resumen financiero
   */
  async generateFinancialSummaryExcel(data: any, res: Response): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resumen Financiero');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Concepto', key: 'concept', width: 30 },
      { header: 'Valor', key: 'value', width: 20 },
    ];

    // Título
    worksheet.mergeCells('A1:B1');
    worksheet.getCell('A1').value = 'RESUMEN FINANCIERO';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Fecha
    worksheet.mergeCells('A2:B2');
    worksheet.getCell('A2').value = `Generado: ${new Date().toLocaleDateString('es-CO')}`;
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    // Espacio
    worksheet.addRow([]);

    // Resumen General
    const summary = data.summary;
    worksheet.addRow({ concept: 'RESUMEN GENERAL', value: '' });
    worksheet.getCell('A5').font = { bold: true, size: 12 };

    worksheet.addRow({ concept: 'Total Esperado', value: `$${this.formatMoney(summary.total_expected)} COP` });
    worksheet.addRow({ concept: 'Total Recibido', value: `$${this.formatMoney(summary.total_received)} COP` });
    worksheet.addRow({ concept: 'Total Pendiente', value: `$${this.formatMoney(summary.total_pending)} COP` });
    worksheet.addRow({ concept: 'Tasa de Recaudo', value: `${summary.collection_rate}%` });

    // Resaltar tasa de recaudo
    const recaudoRow = worksheet.getRow(9);
    recaudoRow.font = { bold: true };
    recaudoRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: summary.collection_rate >= 90 ? 'FF90EE90' : 'FFFFA500' },
    };

    // Espacio
    worksheet.addRow([]);
    worksheet.addRow([]);

    // Detalle por Estado
    worksheet.addRow({ concept: 'DETALLE POR ESTADO DE PAGO', value: '' });
    worksheet.getCell('A12').font = { bold: true, size: 12 };

    worksheet.addRow([]);

    // Headers
    const headerRow = worksheet.addRow(['Estado', 'Cantidad', 'Monto Total']);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center' };
    });

    // Ajustar columnas
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 20;

    // Datos
    data.paymentStatus.forEach((status: any) => {
      worksheet.addRow([
        status.status,
        status.count,
        `$${this.formatMoney(status.total_amount)} COP`,
      ]);
    });

    // Enviar archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=resumen-financiero.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Genera Excel de reporte de ocupación
   */
  async generateOccupancyExcel(data: any[], res: Response): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Ocupación');

    // Título
    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').value = 'REPORTE DE OCUPACIÓN';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:H2');
    worksheet.getCell('A2').value = `Fecha: ${new Date().toLocaleDateString('es-CO')}`;
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.addRow([]);

    // Resumen
    const totalUnits = data.reduce((sum, b) => sum + b.total_units, 0);
    const totalOccupied = data.reduce((sum, b) => sum + b.occupied_units, 0);
    const avgOccupancy = (totalOccupied / totalUnits * 100).toFixed(2);
    const totalLostRevenue = data.reduce((sum, b) => sum + b.lost_revenue, 0);

    worksheet.addRow(['RESUMEN GENERAL']);
    worksheet.getCell('A4').font = { bold: true, size: 12 };

    worksheet.addRow(['Total Edificios', data.length]);
    worksheet.addRow(['Total Unidades', totalUnits]);
    worksheet.addRow(['Unidades Ocupadas', totalOccupied]);
    worksheet.addRow(['Tasa de Ocupación Promedio', `${avgOccupancy}%`]);
    worksheet.addRow(['Ingresos Perdidos Totales', `$${this.formatMoney(totalLostRevenue)} COP`]);

    worksheet.addRow([]);
    worksheet.addRow([]);

    // Headers
    worksheet.addRow(['DETALLE POR EDIFICIO']);
    worksheet.getCell('A11').font = { bold: true, size: 12 };

    worksheet.addRow([]);

    const headerRow = worksheet.addRow([
      'Edificio',
      'Total Unidades',
      'Ocupadas',
      'Vacantes',
      'Mantenimiento',
      'Ocupación %',
      'Ingreso Potencial',
      'Ingreso Actual',
      'Ingresos Perdidos',
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center' };
    });

    // Datos
    data.forEach((building) => {
      const row = worksheet.addRow([
        building.building_name,
        building.total_units,
        building.occupied_units,
        building.vacant_units,
        building.maintenance_units,
        `${building.occupancy_rate}%`,
        `$${this.formatMoney(building.potential_monthly_income)}`,
        `$${this.formatMoney(building.current_monthly_income)}`,
        `$${this.formatMoney(building.lost_revenue)}`,
      ]);

      // Colorear según ocupación
      if (building.occupancy_rate >= 90) {
        row.getCell(6).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF90EE90' },
        };
      } else if (building.occupancy_rate < 70) {
        row.getCell(6).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFA500' },
        };
      }
    });

    // Ajustar columnas
    worksheet.columns.forEach((column) => {
      if (column) {
        column.width = 18;
      }
    });
    worksheet.getColumn(1).width = 25;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-ocupacion.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Genera Excel de estado de pagos
   */
  async generatePaymentStatusExcel(data: any[], res: Response): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Estado de Pagos');

    // Título
    worksheet.mergeCells('A1:I1');
    worksheet.getCell('A1').value = 'ESTADO DE PAGOS';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:I2');
    worksheet.getCell('A2').value = `Generado: ${new Date().toLocaleDateString('es-CO')}`;
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.addRow([]);

    // Resumen
    const completedPayments = data.filter((p) => p.payment_status === 'Completado').length;
    const overduePayments = data.filter((p) => p.days_overdue !== null && p.days_overdue > 0).length;
    const totalDue = data.reduce((sum, p) => sum + p.amount_due, 0);
    const totalPaid = data.reduce((sum, p) => sum + p.amount_paid, 0);

    worksheet.addRow(['Total Pagos', data.length, '', 'Completados', completedPayments, '', 'Vencidos', overduePayments]);
    worksheet.addRow(['Total Debido', `$${this.formatMoney(totalDue)} COP`, '', 'Total Pagado', `$${this.formatMoney(totalPaid)} COP`]);

    worksheet.addRow([]);
    worksheet.addRow([]);

    // Headers
    const headerRow = worksheet.addRow([
      'ID',
      'Edificio',
      'Unidad',
      'Inquilino',
      'Monto Debido',
      'Monto Pagado',
      'Estado',
      'Fecha Vence',
      'Días Mora',
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center' };
    });

    // Datos
    data.forEach((payment) => {
      const row = worksheet.addRow([
        payment.payment_id,
        payment.building_name,
        payment.unit_number,
        payment.tenant_name,
        payment.amount_due,
        payment.amount_paid,
        payment.payment_status,
        payment.due_date,
        payment.days_overdue !== null ? payment.days_overdue : '-',
      ]);

      // Formato de moneda
      row.getCell(5).numFmt = '$#,##0';
      row.getCell(6).numFmt = '$#,##0';

      // Colorear vencidos
      if (payment.days_overdue !== null && payment.days_overdue > 0) {
        row.getCell(9).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' },
        };
        row.getCell(9).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      }

      // Colorear estado
      if (payment.payment_status === 'Completado') {
        row.getCell(7).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF90EE90' },
        };
      } else if (payment.payment_status === 'Vencido' || payment.payment_status === 'Pendiente') {
        row.getCell(7).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFA500' },
        };
      }
    });

    // Ajustar columnas
    worksheet.columns.forEach((column, i) => {
      if (column) {
        column.width = i === 1 || i === 3 ? 25 : 15;
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=estado-pagos.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Genera Excel de unidades vacantes
   */
  async generateVacantUnitsExcel(data: any, res: Response): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Unidades Vacantes');

    // Título
    worksheet.mergeCells('A1:G1');
    worksheet.getCell('A1').value = 'UNIDADES VACANTES';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:G2');
    worksheet.getCell('A2').value = `Fecha: ${new Date().toLocaleDateString('es-CO')}`;
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.addRow([]);

    // Resumen
    worksheet.addRow(['RESUMEN']);
    worksheet.getCell('A4').font = { bold: true, size: 12 };

    worksheet.addRow(['Total Unidades Vacantes', data.summary.totalVacant]);
    worksheet.addRow(['Ingresos Perdidos Totales', `$${this.formatMoney(data.summary.totalLostRevenue)} COP`]);
    worksheet.addRow(['Promedio Días Vacantes', `${data.summary.averageDaysVacant} días`]);

    worksheet.addRow([]);
    worksheet.addRow([]);

    // Headers
    const headerRow = worksheet.addRow([
      'Edificio',
      'Unidad',
      'Tipo',
      'Precio Arriendo',
      'Último Contrato',
      'Días Vacante',
      'Ingresos Perdidos',
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center' };
    });

    // Datos
    data.data.forEach((unit: any) => {
      const row = worksheet.addRow([
        unit.building_name,
        unit.unit_number,
        unit.unit_type,
        unit.rental_price,
        unit.last_contract_end || 'Nunca arrendada',
        unit.days_vacant || 'N/A',
        unit.estimated_lost_revenue,
      ]);

      // Formato de moneda
      row.getCell(4).numFmt = '$#,##0';
      row.getCell(7).numFmt = '$#,##0';

      // Colorear por días vacante
      if (unit.days_vacant !== null) {
        if (unit.days_vacant > 90) {
          row.getCell(6).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF0000' },
          };
          row.getCell(6).font = { color: { argb: 'FFFFFFFF' }, bold: true };
        } else if (unit.days_vacant > 60) {
          row.getCell(6).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFA500' },
          };
        }
      }
    });

    // Ajustar columnas
    worksheet.columns.forEach((column, i) => {
      if (column) {
        column.width = i === 0 || i === 2 ? 25 : 18;
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=unidades-vacantes.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Formatea números como moneda
   */
  private formatMoney(amount: number): string {
    return new Intl.NumberFormat('es-CO').format(amount);
  }
}

export default new ExcelService();
