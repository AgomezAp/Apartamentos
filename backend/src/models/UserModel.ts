import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class UserModel extends Model {
  public id!: number;
  public email!: string;
  public password_hash!: string;
  public full_name!: string;
  public phone!: string;
  public is_active!: boolean;
  public is_read_only!: boolean;
  public role_id?: number;
  public last_login!: Date;
}

UserModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_read_only: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default UserModel;
