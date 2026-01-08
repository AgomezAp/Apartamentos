import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class BuildingUnitTypeConfigModel extends Model {
  declare building_id: number;
  declare unit_type_id: number;
  declare quantity: number;
  declare base_rent: number;
  declare base_admin_fee: number;
  declare created_at: Date;
  declare updated_at: Date;
}

BuildingUnitTypeConfigModel.init(
  {
    building_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    unit_type_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    base_rent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    base_admin_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'building_unit_type_config',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default BuildingUnitTypeConfigModel;
