import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class BuildingModel extends Model {
  public id!: number;
  public name!: string;
  public address!: string;
  public city!: string;
  public state!: string;
  public postal_code!: string;
  public country!: string;
  public total_floors!: number;
  public total_units!: number;
  public max_capacity!: number;
  public description!: string;
  public construction_year!: number;
  public is_active!: boolean;
}

BuildingModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
    },
    state: {
      type: DataTypes.STRING(100),
    },
    postal_code: {
      type: DataTypes.STRING(20),
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'México',
    },
    total_floors: {
      type: DataTypes.INTEGER,
    },
    total_units: {
      type: DataTypes.INTEGER,
    },
    max_capacity: {
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.TEXT,
    },
    construction_year: {
      type: DataTypes.INTEGER,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'buildings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default BuildingModel;
