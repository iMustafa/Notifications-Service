import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../connection';

import { Tenant } from './Tenant';
import { User } from './User';
import { DeliveryStatus } from './DeliveryStatus';

export class Notification extends Model<InferAttributes<Notification>, InferCreationAttributes<Notification>> {
  declare id: string;
  declare tenant_id: string;
  declare user_id: string;
  declare channel: string;
  declare template_key: string;
  declare template_version: number;
  declare payload: unknown;
  declare status: string;
  declare created_at: CreationOptional<Date>;
  static associate(): void {
    Notification.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
    Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    Notification.hasMany(DeliveryStatus, { foreignKey: 'notification_id', as: 'statuses' });
  }
}

Notification.init({
  id: { type: DataTypes.UUID, primaryKey: true },
  tenant_id: { type: DataTypes.TEXT, allowNull: false },
  user_id: { type: DataTypes.TEXT, allowNull: false },
  channel: { type: DataTypes.TEXT, allowNull: false },
  template_key: { type: DataTypes.TEXT, allowNull: false },
  template_version: { type: DataTypes.INTEGER, allowNull: false },
  payload: { type: DataTypes.JSONB, allowNull: false },
  status: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'queued' },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { sequelize, tableName: 'notifications', timestamps: false });

