import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class PaymentStatusModel extends Model {
  public id!: number;
  public name!: string;
  public color_code!: string;
  public description!: string;
}

PaymentStatusModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    color_code: {
      type: DataTypes.STRING(7),
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    tableName: 'payment_statuses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default PaymentStatusModel;
