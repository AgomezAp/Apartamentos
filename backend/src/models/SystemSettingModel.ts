import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class SystemSettingModel extends Model {
  declare id: number;
  declare setting_key: string;
  declare setting_value: string;
  declare data_type: string;
  declare description: string;
  declare category: string;
  declare is_editable: boolean;
  declare created_at: Date;
  declare updated_at: Date;
}

SystemSettingModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    setting_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    setting_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    data_type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
      defaultValue: 'string',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_editable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'system_settings',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default SystemSettingModel;
