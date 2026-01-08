import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class AlertTypeModel extends Model {
  declare id: number;
  declare name: string;
  declare description: string;
  declare icon: string;
  declare color: string;
  declare is_active: boolean;
  declare created_at: Date;
  declare updated_at: Date;
}

AlertTypeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'alert_types',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default AlertTypeModel;
