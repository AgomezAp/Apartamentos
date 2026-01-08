import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class ContractModel extends Model {
  public id!: number;
  public unit_id!: number;
  public tenant_id!: number;
  public contract_number!: string;
  public start_date!: Date;
  public end_date!: Date;
  public monthly_rent!: number;
  public deposit_amount!: number;
  public payment_day!: number;
  public status!: string;
  public notes!: string;
  public contract_file_path!: string;
  public has_rent_increase!: boolean;
  public rent_increase_percentage!: number;
  public rent_increase_frequency_months!: number;
  public next_increase_date!: Date;
}

ContractModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    unit_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'units',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    contract_number: {
      type: DataTypes.STRING(100),
      unique: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    monthly_rent: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    deposit_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    payment_day: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      validate: {
        isIn: [['active', 'finished', 'cancelled', 'pending']],
      },
    },
    notes: {
      type: DataTypes.TEXT,
    },
    contract_file_path: {
      type: DataTypes.STRING(500),
    },
    has_rent_increase: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rent_increase_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    rent_increase_frequency_months: {
      type: DataTypes.INTEGER,
      defaultValue: 12,
    },
    next_increase_date: {
      type: DataTypes.DATEONLY,
    },
  },
  {
    sequelize,
    tableName: 'contracts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ContractModel;
