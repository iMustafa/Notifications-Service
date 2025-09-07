import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../connection';

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

