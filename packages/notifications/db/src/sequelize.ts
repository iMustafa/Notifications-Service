import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export const sequelize = new Sequelize(process.env.POSTGRES_URL as string, {
  dialect: 'postgres',
  logging: false,
});

export class Tenant extends Model<InferAttributes<Tenant>, InferCreationAttributes<Tenant>> {
  declare id: string;
  declare name: string;
}
Tenant.init({
  id: { type: DataTypes.TEXT, primaryKey: true },
  name: { type: DataTypes.TEXT, allowNull: false },
}, { sequelize, tableName: 'tenants', timestamps: false });

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: string;
  declare tenant_id: string;
  declare email: string | null;
  declare phone: string | null;
  declare locale: string | null;
  declare timezone: string | null;
}
User.init({
  id: { type: DataTypes.TEXT, primaryKey: true },
  tenant_id: { type: DataTypes.TEXT, allowNull: false },
  email: { type: DataTypes.TEXT },
  phone: { type: DataTypes.TEXT },
  locale: { type: DataTypes.TEXT },
  timezone: { type: DataTypes.TEXT },
}, { sequelize, tableName: 'users', timestamps: false });

export class ChannelPreference extends Model<InferAttributes<ChannelPreference>, InferCreationAttributes<ChannelPreference>> {
  declare tenant_id: string;
  declare user_id: string;
  declare channel: string;
  declare enabled: boolean;
}
ChannelPreference.init({
  tenant_id: { type: DataTypes.TEXT, primaryKey: true },
  user_id: { type: DataTypes.TEXT, primaryKey: true },
  channel: { type: DataTypes.TEXT, primaryKey: true },
  enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { sequelize, tableName: 'channel_preferences', timestamps: false });

export class TemplateOverride extends Model<InferAttributes<TemplateOverride>, InferCreationAttributes<TemplateOverride>> {
  declare tenant_id: string;
  declare user_id: string;
  declare template_key: string;
  declare enabled: boolean;
}
TemplateOverride.init({
  tenant_id: { type: DataTypes.TEXT, primaryKey: true },
  user_id: { type: DataTypes.TEXT, primaryKey: true },
  template_key: { type: DataTypes.TEXT, primaryKey: true },
  enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { sequelize, tableName: 'template_overrides', timestamps: false });

export class Template extends Model<InferAttributes<Template>, InferCreationAttributes<Template>> {
  declare key: string;
  declare version: number;
  declare channel: string;
  declare locale: string;
  declare subject: string | null;
  declare body: string;
  declare data_schema: unknown | null;
}
Template.init({
  key: { type: DataTypes.TEXT, primaryKey: true },
  version: { type: DataTypes.INTEGER, primaryKey: true },
  channel: { type: DataTypes.TEXT, primaryKey: true },
  locale: { type: DataTypes.TEXT, primaryKey: true },
  subject: { type: DataTypes.TEXT },
  body: { type: DataTypes.TEXT, allowNull: false },
  data_schema: { type: DataTypes.JSONB },
}, { sequelize, tableName: 'templates', timestamps: false });

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

export class DeliveryStatus extends Model<InferAttributes<DeliveryStatus>, InferCreationAttributes<DeliveryStatus>> {
  declare id: CreationOptional<number>;
  declare notification_id: string;
  declare provider: string;
  declare status: string;
  declare code: string | null;
  declare message: string | null;
  declare meta: unknown | null;
  declare created_at: CreationOptional<Date>;
}
DeliveryStatus.init({
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  notification_id: { type: DataTypes.UUID, allowNull: false },
  provider: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.TEXT, allowNull: false },
  code: { type: DataTypes.TEXT },
  message: { type: DataTypes.TEXT },
  meta: { type: DataTypes.JSONB },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { sequelize, tableName: 'delivery_status', timestamps: false });

export class Outbox extends Model<InferAttributes<Outbox>, InferCreationAttributes<Outbox>> {
  declare id: CreationOptional<number>;
  declare aggregate_type: string;
  declare aggregate_id: string;
  declare payload: unknown;
  declare published: boolean;
  declare created_at: CreationOptional<Date>;
}
Outbox.init({
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  aggregate_type: { type: DataTypes.TEXT, allowNull: false },
  aggregate_id: { type: DataTypes.TEXT, allowNull: false },
  payload: { type: DataTypes.JSONB, allowNull: false },
  published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { sequelize, tableName: 'outbox', timestamps: false });

export async function initDb(): Promise<void> {
  await sequelize.authenticate();
}

