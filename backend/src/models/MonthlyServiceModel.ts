import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class MonthlyServiceModel extends Model {
  declare id: number;
  declare building_id: number;
  declare service_type_id: number;
  declare month: number;
  declare year: number;
  declare total_cost: number;
  declare cost_per_unit: number;
  declare reading_date: Date | null;
  declare notes: string | null;
  declare created_at: Date;
  declare updated_at: Date;
}

MonthlyServiceModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    building_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    service_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    cost_per_unit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    reading_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'monthly_services',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default MonthlyServiceModel;
