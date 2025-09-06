'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('templates', {
      key: { type: Sequelize.TEXT, allowNull: false, primaryKey: true },
      version: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true },
      channel: { type: Sequelize.TEXT, allowNull: false, primaryKey: true },
      locale: { type: Sequelize.TEXT, allowNull: false, primaryKey: true },
      subject: { type: Sequelize.TEXT, allowNull: true },
      body: { type: Sequelize.TEXT, allowNull: false },
      data_schema: { type: Sequelize.JSONB, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    const seeds = [
      // billing.invoice.created
      {
        key: 'billing.invoice.created',
        version: 1,
        channel: 'email',
        locale: 'en',
        subject: 'Your invoice {{invoiceId}}',
        body: '<h1>Thanks!</h1><p>Amount: {{amount}} {{currency}}</p><p>Invoice: {{invoiceId}}</p>'
      },
      {
        key: 'billing.invoice.created',
        version: 1,
        channel: 'inapp',
        locale: 'en',
        body: 'Invoice {{invoiceId}}: {{amount}} {{currency}}'
      },
      // auth.password.reset.requested
      {
        key: 'auth.password.reset.requested',
        version: 1,
        channel: 'email',
        locale: 'en',
        subject: 'Password reset',
        body: '<p>Click to reset your password</p>'
      },
      {
        key: 'auth.password.reset.requested',
        version: 1,
        channel: 'sms',
        locale: 'en',
        body: 'Reset code: {{code}}'
      },
      // auth.password.reset.confirmed
      {
        key: 'auth.password.reset.confirmed',
        version: 1,
        channel: 'email',
        locale: 'en',
        subject: 'Password reset confirmed',
        body: '<p>Your password was reset at {{timestamp}}</p>'
      },
      {
        key: 'auth.password.reset.confirmed',
        version: 1,
        channel: 'inapp',
        locale: 'en',
        body: 'Password reset confirmed at {{timestamp}}'
      }
    ];

    await queryInterface.bulkInsert('templates', seeds);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('templates', { key: [
      'billing.invoice.created',
      'auth.password.reset.requested',
      'auth.password.reset.confirmed'
    ] });
    await queryInterface.dropTable('templates');
  }
};
