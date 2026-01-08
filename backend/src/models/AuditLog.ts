// AuditLog Model
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class AuditLogModel extends Model {
  public id!: bigint;
  public user_id!: number;
  public action!: string;
  public table_name!: string;
  public record_id!: number;
  public old_values!: any;
  public new_values!: any;
  public ip_address!: string;
  public user_agent!: string;
}

AuditLogModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    table_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    record_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    old_values: {
      type: DataTypes.JSONB,
    },
    new_values: {
      type: DataTypes.JSONB,
    },
    ip_address: {
      type: DataTypes.STRING(45),
    },
    user_agent: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default AuditLogModel;
