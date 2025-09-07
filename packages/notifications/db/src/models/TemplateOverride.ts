import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../connection';

import { Tenant } from './Tenant';
import { User } from './User';

export class TemplateOverride extends Model<InferAttributes<TemplateOverride>, InferCreationAttributes<TemplateOverride>> {
  declare tenant_id: string;
  declare user_id: string;
  declare template_key: string;
  declare enabled: boolean;
  static associate(): void {
    TemplateOverride.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
    TemplateOverride.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  }
}

TemplateOverride.init({
  tenant_id: { type: DataTypes.TEXT, primaryKey: true },
  user_id: { type: DataTypes.TEXT, primaryKey: true },
  template_key: { type: DataTypes.TEXT, primaryKey: true },
  enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { sequelize, tableName: 'template_overrides', timestamps: false });

