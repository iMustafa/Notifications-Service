import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(process.env.POSTGRES_URL as string, {
  dialect: 'postgres',
  logging: false,
});

export async function initDb(): Promise<void> {
  await sequelize.authenticate();
}
