import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailNotification, NotificationProvider } from './interfaces/notification-provider';

@Injectable()
export class EmailService implements NotificationProvider {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private fromEmail: string;
  private enabled: boolean;

  constructor(private configService: ConfigService) {
    const config = this.configService.get('notifications') as {
      resendApiKey: string;
      resendFromEmail: string;
      resendEnabled: boolean;
    };

    this.enabled = Boolean(config?.resendEnabled && config?.resendApiKey);
    this.fromEmail = config?.resendFromEmail ?? 'Beautivo <no-reply@beautivo.local>';

    if (this.enabled) {
      this.resend = new Resend(config.resendApiKey);
    }
  }

  async sendEmail(notification: EmailNotification): Promise<void> {
    if (!this.enabled || !this.resend) {
      this.logger.warn(`Resend not configured. Skipping email to ${notification.to}.`);
      return;
    }

    await this.resend.emails.send({
      from: this.fromEmail,
      to: notification.to,
      subject: notification.subject,
      html: notification.html,
      text: notification.text,
    });
  }
}
