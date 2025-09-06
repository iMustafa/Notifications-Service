import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../connection';

import { Notification } from './Notification';

export class DeliveryStatus extends Model<InferAttributes<DeliveryStatus>, InferCreationAttributes<DeliveryStatus>> {
  declare id: CreationOptional<number>;
  declare notification_id: string;
  declare provider: string;
  declare status: string;
  declare code: string | null;
  declare message: string | null;
  declare meta: unknown | null;
  declare created_at: CreationOptional<Date>;
  static associate(): void {
    DeliveryStatus.belongsTo(Notification, { foreignKey: 'notification_id', as: 'notification' });
  }
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

