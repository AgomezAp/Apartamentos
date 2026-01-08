import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class UnitServiceModel extends Model {
  declare unit_id: number;
  declare service_type_id: number;
  declare is_included: boolean;
  declare additional_cost: number;
  declare notes: string | null;
  declare created_at: Date;
  declare updated_at: Date;
}

UnitServiceModel.init(
  {
    unit_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    service_type_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    is_included: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    additional_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'unit_services',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default UnitServiceModel;
