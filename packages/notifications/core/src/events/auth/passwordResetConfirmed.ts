import { z } from 'zod';
import { EventDefinition } from '../../types/EventDefinition';

export const passwordResetConfirmed: EventDefinition<'auth.password.reset.confirmed'> = {
  key: 'auth.password.reset.confirmed',
  title: 'Password Reset Confirmed',
  uiFields: [
    { key: 'userEmail', label: 'User Email', type: 'email', placeholder: 'user@example.com' },
    { key: 'timestamp', label: 'Confirmed At (ISO)', type: 'text', placeholder: new Date().toISOString() }
  ],
  defaultPlan: { primary: 'email', fallbacks: ['inapp'], templateKey: 'auth.password.reset.confirmed' },
  allowedChannels: ['email', 'inapp'],
  templateKey: 'auth.password.reset.confirmed'
};

export const passwordResetConfirmedPayload = z.object({
  userEmail: z.string().email(),
  timestamp: z.string().datetime()
});

