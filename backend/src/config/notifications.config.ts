import { registerAs } from '@nestjs/config';

export default registerAs('notifications', () => ({
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? 'Beautivo <no-reply@beautivo.local>',
  resendEnabled: (process.env.RESEND_ENABLED ?? 'false') === 'true',
}));
