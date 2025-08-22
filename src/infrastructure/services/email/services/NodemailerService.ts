import nodemailer from 'nodemailer';
import { IEmailService } from '../interface/IEmailService';
import { config } from '../../../../config/env';
import { InternalServerError } from '../../../../utils/error';

export class NodemailerService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const smtpConfig = {
      host: config.SMTP_HOST,
      port: parseInt(config.SMTP_PORT || '587'),
      secure: config.SMTP_SECURE === 'true',
      ...(process.env.NODE_ENV === 'test'
        ? {}
        : {
            service: 'Gmail',
            auth: {
              user: config.SMTP_USER,
              pass: config.SMTP_PASS
            }
          })
    };

    this.transporter = nodemailer.createTransport(
      smtpConfig as nodemailer.TransportOptions
    );
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<void> {
    const { to, subject, text, html } = params;
    try {
      console.log(`Attempting to send email to ${to}`);
      const result = await this.transporter.sendMail({
        from: config.SMTP_FROM,
        to,
        subject,
        text,
        html
      });
      console.log('Email sent successfully:', result.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerError('Failed to send email');
    }
  }
}
