'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('tenants', {
      id: { type: Sequelize.TEXT, primaryKey: true },
      name: { type: Sequelize.TEXT, allowNull: false }
    });

    await queryInterface.createTable('users', {
      id: { type: Sequelize.TEXT, primaryKey: true },
      tenant_id: { type: Sequelize.TEXT, allowNull: false, references: { model: 'tenants', key: 'id' } },
      email: { type: Sequelize.TEXT },
      phone: { type: Sequelize.TEXT },
      locale: { type: Sequelize.TEXT, allowNull: true, defaultValue: 'en' },
      timezone: { type: Sequelize.TEXT, allowNull: true, defaultValue: 'UTC' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });

    // Seed tenant and users (For testing)
    await queryInterface.bulkInsert('tenants', [
      { id: 't_demo', name: 'Demo Tenant' }
    ]);

    await queryInterface.bulkInsert('users', [
      { id: 'u_1', tenant_id: 't_demo', email: 'alice@example.com', phone: '+15550001111', locale: 'en', timezone: 'UTC' },
      { id: 'u_2', tenant_id: 't_demo', email: 'bob@example.com', phone: '+15550002222', locale: 'en', timezone: 'America/Los_Angeles' }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { id: ['u_1', 'u_2'] });
    await queryInterface.bulkDelete('tenants', { id: 't_demo' });
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('tenants');
  }
};
