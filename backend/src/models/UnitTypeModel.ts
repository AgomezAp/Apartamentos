import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class UnitTypeModel extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public is_active!: boolean;
}

UnitTypeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'unit_types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default UnitTypeModel;
