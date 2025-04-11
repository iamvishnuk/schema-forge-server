import { Resend } from 'resend';
import { config } from '../../../../config/env';

export const resend = new Resend(config.RESEND_API_KEY);
