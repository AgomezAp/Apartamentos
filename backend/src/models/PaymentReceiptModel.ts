import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class PaymentReceiptModel extends Model {
  public id!: number;
  public payment_id!: number;
  public file_path!: string;
  public original_name!: string;
  public file_size!: number;
  public uploaded_at!: Date;
}

PaymentReceiptModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'payments',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    uploaded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'payment_receipts',
    timestamps: false,
  }
);

export default PaymentReceiptModel;
