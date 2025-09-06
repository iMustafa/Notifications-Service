import { TemplateSeed } from "../../types/TemplateSeed";

export const invoiceCreatedTemplateSeeds: TemplateSeed[] = [
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
  }
];
