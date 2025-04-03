export interface IEmailService {
  sendEmail(params: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<void>;
}
