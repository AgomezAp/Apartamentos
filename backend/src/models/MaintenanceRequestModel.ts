import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class MaintenanceRequestModel extends Model {
  declare id: number;
  declare unit_id: number;
  declare tenant_id: number;
  declare title: string;
  declare description: string;
  declare priority: string;
  declare status: string;
  declare category: string;
  declare reported_date: Date;
  declare scheduled_date: Date | null;
  declare completed_date: Date | null;
  declare assigned_to: number | null;
  declare resolved_by: number | null;
  declare estimated_cost: number | null;
  declare actual_cost: number | null;
  declare notes: string | null;
  declare attachments: any;
  declare created_at: Date;
  declare updated_at: Date;
}

MaintenanceRequestModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    unit_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    priority: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    reported_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    scheduled_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    assigned_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    resolved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    estimated_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    actual_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'maintenance_requests',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default MaintenanceRequestModel;
