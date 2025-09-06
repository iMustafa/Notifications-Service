'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('outbox', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      aggregate_type: { type: Sequelize.TEXT, allowNull: false },
      aggregate_id: { type: Sequelize.TEXT, allowNull: false },
      payload: { type: Sequelize.JSONB, allowNull: false },
      published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addIndex('outbox', ['published'], { name: 'idx_outbox_unpublished', where: { published: false } });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('outbox', 'idx_outbox_unpublished');
    await queryInterface.dropTable('outbox');
  }
};
