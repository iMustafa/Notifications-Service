import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../connection';

import { User } from './User';
import { Notification } from './Notification';

export class Tenant extends Model<InferAttributes<Tenant>, InferCreationAttributes<Tenant>> {
  declare id: string;
  declare name: string;
  static associate(): void {
    Tenant.hasMany(User, { foreignKey: 'tenant_id', as: 'users' });
    Tenant.hasMany(Notification, { foreignKey: 'tenant_id', as: 'notifications' });
  }
}

Tenant.init({
  id: { type: DataTypes.TEXT, primaryKey: true },
  name: { type: DataTypes.TEXT, allowNull: false },
}, { sequelize, tableName: 'tenants', timestamps: false });

