'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('channel_preferences', {
      tenant_id: { type: Sequelize.TEXT, allowNull: false, primaryKey: true, references: { model: 'tenants', key: 'id' } },
      user_id: { type: Sequelize.TEXT, allowNull: false, primaryKey: true, references: { model: 'users', key: 'id' } },
      channel: { type: Sequelize.TEXT, allowNull: false, primaryKey: true },
      enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    });
    
    const channels = ['email','inapp','sms','push'];
    const rows = [];
    for (const ch of channels) {
      rows.push({ tenant_id: 't_demo', user_id: 'u_1', channel: ch, enabled: true });
      rows.push({ tenant_id: 't_demo', user_id: 'u_2', channel: ch, enabled: true });
    }
    await queryInterface.bulkInsert('channel_preferences', rows);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('channel_preferences', { tenant_id: 't_demo', user_id: ['u_1','u_2'] });
    await queryInterface.dropTable('channel_preferences');
  }
};
