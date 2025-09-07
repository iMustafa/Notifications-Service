import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../connection';

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

