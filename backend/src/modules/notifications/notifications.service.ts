import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { renderOtpEmail } from './templates/otp-verification';

@Injectable()
export class NotificationsService {
  constructor(private emailService: EmailService) {}

  async sendOtpEmail(email: string, otp: string, shopName?: string | null) {
    const template = renderOtpEmail({
      otp,
      expiresInMinutes: 10,
      shopName,
    });

    await this.emailService.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }
}
