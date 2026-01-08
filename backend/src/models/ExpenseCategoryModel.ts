import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class ExpenseCategoryModel extends Model {
  declare id: number;
  declare name: string;
  declare description: string;
  declare is_active: boolean;
  declare created_at: Date;
  declare updated_at: Date;
}

ExpenseCategoryModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'expense_categories',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ExpenseCategoryModel;
