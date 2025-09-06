import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../connection';

import { Tenant } from './Tenant';
import { User } from './User';

export class ChannelPreference extends Model<InferAttributes<ChannelPreference>, InferCreationAttributes<ChannelPreference>> {
  declare tenant_id: string;
  declare user_id: string;
  declare channel: string;
  declare enabled: boolean;
  static associate(): void {
    ChannelPreference.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
    ChannelPreference.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  }
}

ChannelPreference.init({
  tenant_id: { type: DataTypes.TEXT, primaryKey: true },
  user_id: { type: DataTypes.TEXT, primaryKey: true },
  channel: { type: DataTypes.TEXT, primaryKey: true },
  enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { sequelize, tableName: 'channel_preferences', timestamps: false });

