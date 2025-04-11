import { CreateEmailResponse } from 'resend';
import { resend } from '../config/resendClient';
import { config } from '../../../../config/env';

interface SendEmailProps {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
}

const mailer_sender =
  config.NODE_ENV === 'development'
    ? `no-reply <onboarding@resend.dev>`
    : `no-reply <${config.MAILER_SENDER}>`;

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  from = mailer_sender
}: SendEmailProps): Promise<CreateEmailResponse> => {
  return await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    text,
    subject,
    html
  });
};
