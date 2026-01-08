import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class ExpenseModel extends Model {
  declare id: number;
  declare building_id: number;
  declare category_id: number;
  declare description: string;
  declare amount: number;
  declare expense_date: Date;
  declare payment_method: string;
  declare reference_number: string | null;
  declare receipt_file_path: string | null;
  declare notes: string | null;
  declare created_by: number;
  declare created_at: Date;
  declare updated_at: Date;
}

ExpenseModel.init(
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
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    expense_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    reference_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    receipt_file_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'expenses',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ExpenseModel;
