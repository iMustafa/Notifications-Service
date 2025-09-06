import { invoiceCreatedTemplateSeeds } from './billing/invoiceCreatedSeeder';
import { passwordResetRequestedTemplateSeeds } from './auth/passwordResetRequestedSeeder';
import { passwordResetConfirmedTemplateSeeds } from './auth/passwordResetConfirmedSeeder';

export const getTemplateSeeds = () => {
  return [
    ...invoiceCreatedTemplateSeeds,
    ...passwordResetRequestedTemplateSeeds,
    ...passwordResetConfirmedTemplateSeeds
  ];
};