import { z } from 'zod';
import { EventDefinition } from '../../types/EventDefinition';

export const passwordResetRequested: EventDefinition<'auth.password.reset.requested'> = {
  key: 'auth.password.reset.requested',
  title: 'Password Reset Requested',
  uiFields: [
    { key: 'userEmail', label: 'User Email', type: 'email', placeholder: 'user@example.com' },
    { key: 'code', label: 'Code', type: 'text', placeholder: '123456' }
  ],
  defaultPlan: { primary: 'email', fallbacks: ['sms'], templateKey: 'auth.password.reset.requested' },
  allowedChannels: ['email', 'sms'],
  templateKey: 'auth.password.reset.requested'
};

export const passwordResetRequestedPayload = z.object({
  userEmail: z.string().email().optional(),
  code: z.string().min(4).max(12).optional()
});

