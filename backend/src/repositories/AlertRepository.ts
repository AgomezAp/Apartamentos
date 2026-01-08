import { executeQuery } from '../config/database';
import { sendMail } from '../config/email';

interface AlertData {
  alert_type_id: number;
  title: string;
  message: string;
  priority: string;
  contract_id?: number;
  unit_id?: number;
  building_id?: number;
  payment_id?: number;
  metadata?: any;
}

class AlertRepository {
  /**
   * Crear una nueva alerta
   */
  async create(alertData: AlertData): Promise<number> {
    const query = `
      INSERT INTO alerts (
        alert_type_id, title, message, priority,
        contract_id, unit_id, building_id, payment_id, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const result: any = await executeQuery(query, [
      alertData.alert_type_id,
      alertData.title,
      alertData.message,
      alertData.priority,
      alertData.contract_id || null,
      alertData.unit_id || null,
      alertData.building_id || null,
      alertData.payment_id || null,
      JSON.stringify(alertData.metadata || {}),
    ]);
    return result[0].id;
  }

  /**
   * Enviar alerta por email
   */
  async sendEmailAlert(alertId: number, emails: string[]): Promise<void> {
    try {
      // Obtener información de la alerta
      const query = 'SELECT title, message, priority FROM alerts WHERE id = $1';
      const result: any = await executeQuery(query, [alertId]);
      
      if (result && result.length > 0) {
        const alert = result[0];
        
        // Preparar el mensaje
        const subject = `Alerta - ${alert.title}`;
        const text = `
Prioridad: ${alert.priority.toUpperCase()}

${alert.title}

${alert.message}

Fecha: ${new Date().toLocaleString('es-CO')}

---
Este es un mensaje automático del Sistema de Gestión Inmobiliaria.
Por favor, no responda a este correo.
        `;
        
        // Enviar el email usando el nuevo método
        await sendMail(emails, subject, text);
        
        // Actualizar estado de la alerta (marcar como enviada usando metadata)
        const jsonMetadata = {
          email_sent: true,
          sent_at: new Date().toISOString(),
        };
        await executeQuery(
          `UPDATE alerts SET 
             metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
             updated_at = CURRENT_TIMESTAMP 
           WHERE id = $1`,
          [alertId, JSON.stringify(jsonMetadata)]
        );
        
        console.log(`✅ Email enviado para alerta ${alertId} a:`, emails);
      }
    } catch (error) {
      console.error(`❌ Error enviando email para alerta ${alertId}:`, error);
      throw error;
    }
  }
}

export default new AlertRepository();
