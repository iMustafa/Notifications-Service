'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.UUID, primaryKey: true },
      tenant_id: { type: Sequelize.TEXT, allowNull: false, references: { model: 'tenants', key: 'id' } },
      user_id: { type: Sequelize.TEXT, allowNull: false, references: { model: 'users', key: 'id' } },
      channel: { type: Sequelize.TEXT, allowNull: false },
      template_key: { type: Sequelize.TEXT, allowNull: false },
      template_version: { type: Sequelize.INTEGER, allowNull: false },
      payload: { type: Sequelize.JSONB, allowNull: false },
      status: { type: Sequelize.TEXT, allowNull: false, defaultValue: 'queued' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('notifications');
  }
};
