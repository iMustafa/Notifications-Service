'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('delivery_status', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      notification_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'notifications', key: 'id' } },
      provider: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.TEXT, allowNull: false },
      code: { type: Sequelize.TEXT },
      message: { type: Sequelize.TEXT },
      meta: { type: Sequelize.JSONB },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('delivery_status');
  }
};
