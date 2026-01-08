import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class PaymentTransactionModel extends Model {
  declare id: number;
  declare payment_id: number;
  declare transaction_type: string;
  declare amount: number;
  declare payment_method: string;
  declare reference_number: string | null;
  declare transaction_date: Date;
  declare receipt_file_path: string | null;
  declare notes: string | null;
  declare created_by: number;
  declare created_at: Date;
}

PaymentTransactionModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    transaction_type: {
      type: DataTypes.ENUM('payment', 'refund', 'adjustment'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
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
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
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
    tableName: 'payment_transactions',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default PaymentTransactionModel;
