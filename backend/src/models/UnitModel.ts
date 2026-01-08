import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class UnitModel extends Model {
  public id!: number;
  public building_id!: number;
  public unit_type_id!: number;
  public unit_number!: string;
  public floor!: number;
  public area_sqm!: number;
  public bedrooms!: number;
  public bathrooms!: number;
  public rental_price!: number;
  public is_occupied!: boolean;
  public occupation_status!: string;
  public description!: string;
  public features!: any;
  public is_active!: boolean;
}

UnitModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    building_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'buildings',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    unit_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'unit_types',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    unit_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    floor: {
      type: DataTypes.INTEGER,
    },
    area_sqm: {
      type: DataTypes.DECIMAL(10, 2),
    },
    bedrooms: {
      type: DataTypes.INTEGER,
    },
    bathrooms: {
      type: DataTypes.INTEGER,
    },
    rental_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    is_occupied: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    occupation_status: {
      type: DataTypes.STRING(20),
      defaultValue: 'vacant',
      validate: {
        isIn: [['occupied', 'vacant', 'maintenance', 'reserved']],
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    features: {
      type: DataTypes.JSONB,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'units',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['building_id', 'unit_number'],
      },
    ],
  }
);

export default UnitModel;
