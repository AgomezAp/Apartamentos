import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class PaymentModel extends Model {
  public id!: number;
  public contract_id!: number;
  public payment_status_id!: number;
  public period_month!: number;
  public period_year!: number;
  public due_date!: Date;
  public payment_date!: Date;
  public amount_due!: number;
  public amount_paid!: number;
  public payment_method!: string;
  public reference_number!: string;
  public notes!: string;
}

PaymentModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    contract_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'contracts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    payment_status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'payment_statuses',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    period_month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    period_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATEONLY,
    },
    amount_due: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    amount_paid: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    payment_method: {
      type: DataTypes.STRING(50),
    },
    reference_number: {
      type: DataTypes.STRING(100),
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default PaymentModel;
