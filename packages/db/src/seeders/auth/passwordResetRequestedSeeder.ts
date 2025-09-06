import { TemplateSeed } from "../../types/TemplateSeed";

export const passwordResetRequestedTemplateSeeds: TemplateSeed[] = [
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
  }
];
