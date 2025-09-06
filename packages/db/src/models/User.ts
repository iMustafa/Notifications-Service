import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../connection';

import { Tenant } from './Tenant';
import { Notification } from './Notification';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: string;
  declare tenant_id: string;
  declare email: string | null;
  declare phone: string | null;
  declare locale: string | null;
  declare timezone: string | null;
  static associate(): void {
    User.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
    User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
  }
}

User.init({
  id: { type: DataTypes.TEXT, primaryKey: true },
  tenant_id: { type: DataTypes.TEXT, allowNull: false },
  email: { type: DataTypes.TEXT },
  phone: { type: DataTypes.TEXT },
  locale: { type: DataTypes.TEXT },
  timezone: { type: DataTypes.TEXT },
}, { sequelize, tableName: 'users', timestamps: false });

