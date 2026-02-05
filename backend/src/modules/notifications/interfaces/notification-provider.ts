export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface NotificationProvider {
  sendEmail(notification: EmailNotification): Promise<void>;
}
