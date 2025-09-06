import type { TemplateSeed } from '../../types/TemplateSeed';

export const passwordResetConfirmedTemplateSeeds: TemplateSeed[] = [
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

