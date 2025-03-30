// src/config/index.ts
import dotenv from 'dotenv';
import path from 'path';

// Determine which environment file to use
const environment = process.env.NODE_ENV || 'development';
const envFile = `.env.${environment}`;

// Load environment-specific variables
dotenv.config({ path: path.resolve(__dirname, `../../${envFile}`) });

// Log which environment file is being used
console.log(`Using environment configuration: ${envFile}`);

export const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  BASE_PATH: process.env.BASE_PATH || '/api/v1',

  APP_ORIGIN: process.env.APP_ORIGIN || 'http://localhost:3000',

  MONGO_URI: process.env.MONGO_URI,

  JWT_SECRET: process.env.JWT_SECRET || 'your_default_jwt_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || 'your_default_jwt_refresh_secret',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Resend API Key
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  MAILER_SENDER: process.env.MAILER_SENDER,

  // node Mailer keys
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM
};
