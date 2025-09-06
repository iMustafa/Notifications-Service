'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('template_overrides', {
      tenant_id: { type: Sequelize.TEXT, allowNull: false, primaryKey: true, references: { model: 'tenants', key: 'id' } },
      user_id: { type: Sequelize.TEXT, allowNull: false, primaryKey: true, references: { model: 'users', key: 'id' } },
      template_key: { type: Sequelize.TEXT, allowNull: false, primaryKey: true },
      enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true }
    });
    // Seed template override to disable invoice email for u_2
    await queryInterface.bulkInsert('template_overrides', [
      { tenant_id: 't_demo', user_id: 'u_2', template_key: 'billing.invoice.created', enabled: false }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('template_overrides', { tenant_id: 't_demo', user_id: 'u_2', template_key: 'billing.invoice.created' });
    await queryInterface.dropTable('template_overrides');
  }
};
