import PDFDocument from 'pdfkit';
import { Response } from 'express';

/**
 * Servicio para generación de PDF
 */
class PdfService {
  /**
   * Genera PDF de resumen financiero
   */
  generateFinancialSummaryPdf(data: any, res: Response): void {
    const doc = new PDFDocument({ margin: 50 });

    // Headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resumen-financiero.pdf');

    doc.pipe(res);

    // Título
    doc.fontSize(20).font('Helvetica-Bold').text('Resumen Financiero', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, { align: 'center' });
    doc.moveDown(2);

    // Resumen general
    doc.fontSize(14).font('Helvetica-Bold').text('Resumen General');
    doc.moveDown(0.5);
    
    const summary = data.summary;
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Esperado: $${this.formatMoney(summary.total_expected)} COP`);
    doc.text(`Total Recibido: $${this.formatMoney(summary.total_received)} COP`);
    doc.text(`Total Pendiente: $${this.formatMoney(summary.total_pending)} COP`);
    doc.text(`Tasa de Recaudo: ${summary.collection_rate}%`, { underline: true });
    doc.moveDown(2);

    // Estado de pagos
    doc.fontSize(14).font('Helvetica-Bold').text('Detalle por Estado de Pago');
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const col1X = 50;
    const col2X = 250;
    const col3X = 400;

    // Encabezados de tabla
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Estado', col1X, tableTop);
    doc.text('Cantidad', col2X, tableTop);
    doc.text('Monto Total', col3X, tableTop);
    
    doc.moveTo(col1X, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(0.5);

    // Datos de tabla
    doc.font('Helvetica');
    data.paymentStatus.forEach((status: any) => {
      const y = doc.y;
      doc.text(status.status, col1X, y);
      doc.text(status.count.toString(), col2X, y);
      doc.text(`$${this.formatMoney(status.total_amount)} COP`, col3X, y);
      doc.moveDown(0.8);
    });

    // Footer
    doc.fontSize(8).font('Helvetica-Oblique');
    doc.text('Sistema de Gestión de Apartamentos - Reporte Generado Automáticamente', 50, 750, { align: 'center' });

    doc.end();
  }

  /**
   * Genera PDF de reporte de ocupación
   */
  generateOccupancyPdf(data: any[], res: Response): void {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-ocupacion.pdf');

    doc.pipe(res);

    // Título
    doc.fontSize(20).font('Helvetica-Bold').text('Reporte de Ocupación', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, { align: 'center' });
    doc.moveDown(2);

    // Resumen
    const totalBuildings = data.length;
    const totalUnits = data.reduce((sum, b) => sum + b.total_units, 0);
    const totalOccupied = data.reduce((sum, b) => sum + b.occupied_units, 0);
    const avgOccupancy = (totalOccupied / totalUnits * 100).toFixed(2);
    const totalLostRevenue = data.reduce((sum, b) => sum + b.lost_revenue, 0);

    doc.fontSize(12).font('Helvetica-Bold').text('Resumen General');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total Edificios: ${totalBuildings}`);
    doc.text(`Total Unidades: ${totalUnits}`);
    doc.text(`Unidades Ocupadas: ${totalOccupied}`);
    doc.text(`Tasa de Ocupación Promedio: ${avgOccupancy}%`);
    doc.text(`Ingresos Perdidos Totales: $${this.formatMoney(totalLostRevenue)} COP`);
    doc.moveDown(2);

    // Detalle por edificio
    doc.fontSize(14).font('Helvetica-Bold').text('Detalle por Edificio');
    doc.moveDown(1);

    data.forEach((building, index) => {
      if (index > 0 && index % 5 === 0) {
        doc.addPage();
      }

      doc.fontSize(12).font('Helvetica-Bold').text(building.building_name);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Unidades Totales: ${building.total_units}`, { indent: 20 });
      doc.text(`Ocupadas: ${building.occupied_units} | Vacantes: ${building.vacant_units} | Mantenimiento: ${building.maintenance_units}`, { indent: 20 });
      doc.text(`Tasa de Ocupación: ${building.occupancy_rate}%`, { indent: 20 });
      doc.text(`Ingreso Potencial: $${this.formatMoney(building.potential_monthly_income)} COP`, { indent: 20 });
      doc.text(`Ingreso Actual: $${this.formatMoney(building.current_monthly_income)} COP`, { indent: 20 });
      doc.text(`Ingresos Perdidos: $${this.formatMoney(building.lost_revenue)} COP`, { indent: 20, underline: true });
      doc.moveDown(1.5);
    });

    // Footer
    doc.fontSize(8).font('Helvetica-Oblique');
    doc.text('Sistema de Gestión de Apartamentos', 50, 750, { align: 'center' });

    doc.end();
  }

  /**
   * Genera PDF de estado de pagos
   */
  generatePaymentStatusPdf(data: any[], res: Response): void {
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=estado-pagos.pdf');

    doc.pipe(res);

    // Título
    doc.fontSize(18).font('Helvetica-Bold').text('Estado de Pagos', { align: 'center' });
    doc.moveDown();
    doc.fontSize(9).font('Helvetica').text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, { align: 'center' });
    doc.moveDown(1.5);

    // Resumen
    const totalPayments = data.length;
    const completedPayments = data.filter(p => p.payment_status === 'Completado').length;
    const overduePayments = data.filter(p => p.days_overdue !== null && p.days_overdue > 0).length;
    const totalDue = data.reduce((sum, p) => sum + p.amount_due, 0);
    const totalPaid = data.reduce((sum, p) => sum + p.amount_paid, 0);

    doc.fontSize(11).font('Helvetica-Bold').text('Resumen');
    doc.fontSize(9).font('Helvetica');
    doc.text(`Total Pagos: ${totalPayments} | Completados: ${completedPayments} | Vencidos: ${overduePayments}`);
    doc.text(`Total Debido: $${this.formatMoney(totalDue)} COP | Total Pagado: $${this.formatMoney(totalPaid)} COP`);
    doc.moveDown(1);

    // Tabla
    const startY = doc.y;
    let currentY = startY;

    // Headers
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('Edificio', 50, currentY, { width: 80 });
    doc.text('Unidad', 135, currentY, { width: 40 });
    doc.text('Inquilino', 180, currentY, { width: 100 });
    doc.text('Monto', 285, currentY, { width: 60 });
    doc.text('Pagado', 350, currentY, { width: 60 });
    doc.text('Estado', 415, currentY, { width: 70 });
    doc.text('Vence', 490, currentY, { width: 60 });
    doc.text('Mora', 555, currentY, { width: 40 });
    
    doc.moveTo(50, currentY + 12).lineTo(790, currentY + 12).stroke();
    currentY += 18;

    // Datos
    doc.fontSize(7).font('Helvetica');
    data.forEach((payment) => {
      if (currentY > 550) {
        doc.addPage();
        currentY = 50;
        
        // Repetir headers
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Edificio', 50, currentY, { width: 80 });
        doc.text('Unidad', 135, currentY, { width: 40 });
        doc.text('Inquilino', 180, currentY, { width: 100 });
        doc.text('Monto', 285, currentY, { width: 60 });
        doc.text('Pagado', 350, currentY, { width: 60 });
        doc.text('Estado', 415, currentY, { width: 70 });
        doc.text('Vence', 490, currentY, { width: 60 });
        doc.text('Mora', 555, currentY, { width: 40 });
        doc.moveTo(50, currentY + 12).lineTo(790, currentY + 12).stroke();
        currentY += 18;
        doc.fontSize(7).font('Helvetica');
      }

      // Resaltar vencidos
      if (payment.days_overdue !== null && payment.days_overdue > 0) {
        doc.fillColor('red');
      } else {
        doc.fillColor('black');
      }

      doc.text(payment.building_name.substring(0, 20), 50, currentY, { width: 80 });
      doc.text(payment.unit_number, 135, currentY, { width: 40 });
      doc.text(payment.tenant_name.substring(0, 25), 180, currentY, { width: 100 });
      doc.text(`$${this.formatMoney(payment.amount_due)}`, 285, currentY, { width: 60 });
      doc.text(`$${this.formatMoney(payment.amount_paid)}`, 350, currentY, { width: 60 });
      doc.text(payment.payment_status, 415, currentY, { width: 70 });
      doc.text(payment.due_date, 490, currentY, { width: 60 });
      doc.text(payment.days_overdue !== null ? payment.days_overdue.toString() : '-', 555, currentY, { width: 40 });
      
      currentY += 14;
      doc.fillColor('black');
    });

    doc.end();
  }

  /**
   * Genera PDF de unidades vacantes
   */
  generateVacantUnitsPdf(data: any, res: Response): void {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=unidades-vacantes.pdf');

    doc.pipe(res);

    // Título
    doc.fontSize(20).font('Helvetica-Bold').text('Unidades Vacantes', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, { align: 'center' });
    doc.moveDown(2);

    // Resumen
    doc.fontSize(12).font('Helvetica-Bold').text('Resumen');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total Unidades Vacantes: ${data.summary.totalVacant}`);
    doc.text(`Ingresos Perdidos Totales: $${this.formatMoney(data.summary.totalLostRevenue)} COP`);
    doc.text(`Promedio Días Vacantes: ${data.summary.averageDaysVacant} días`);
    doc.moveDown(2);

    // Detalle
    doc.fontSize(14).font('Helvetica-Bold').text('Detalle de Unidades');
    doc.moveDown(1);

    data.data.forEach((unit: any, index: number) => {
      if (index > 0 && index % 8 === 0) {
        doc.addPage();
      }

      doc.fontSize(11).font('Helvetica-Bold').text(`${unit.building_name} - Unidad ${unit.unit_number}`);
      doc.fontSize(9).font('Helvetica');
      doc.text(`Tipo: ${unit.unit_type}`, { indent: 20 });
      doc.text(`Precio Arriendo: $${this.formatMoney(unit.rental_price)} COP/mes`, { indent: 20 });
      doc.text(`Último Contrato Finalizó: ${unit.last_contract_end || 'Nunca arrendada'}`, { indent: 20 });
      doc.text(`Días Vacante: ${unit.days_vacant || 'N/A'}`, { indent: 20 });
      doc.text(`Ingresos Perdidos: $${this.formatMoney(unit.estimated_lost_revenue)} COP`, { indent: 20, underline: true });
      doc.moveDown(1);
    });

    doc.end();
  }

  /**
   * Formatea números como moneda
   */
  private formatMoney(amount: number): string {
    return new Intl.NumberFormat('es-CO').format(amount);
  }
}

export default new PdfService();
