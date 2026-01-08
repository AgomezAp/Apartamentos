import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class TenantModel extends Model {
  public id!: number;
  public document_type!: string;
  public document_number!: string;
  public first_name!: string;
  public last_name!: string;
  public email!: string;
  public phone!: string;
  public mobile_phone!: string;
  public emergency_contact_name!: string;
  public emergency_contact_phone!: string;
  public occupation!: string;
  public company_name!: string;
  public monthly_income!: number;
  public notes!: string;
  public is_active!: boolean;
}

TenantModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    document_type: {
      type: DataTypes.STRING(50),
    },
    document_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    mobile_phone: {
      type: DataTypes.STRING(20),
    },
    emergency_contact_name: {
      type: DataTypes.STRING(255),
    },
    emergency_contact_phone: {
      type: DataTypes.STRING(20),
    },
    occupation: {
      type: DataTypes.STRING(100),
    },
    company_name: {
      type: DataTypes.STRING(255),
    },
    monthly_income: {
      type: DataTypes.DECIMAL(12, 2),
    },
    notes: {
      type: DataTypes.TEXT,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'tenants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default TenantModel;
