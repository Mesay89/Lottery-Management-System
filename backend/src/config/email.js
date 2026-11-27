'use strict';

const nodemailer = require('nodemailer');

/**
 * Create and export a reusable nodemailer transporter.
 * Falls back to Ethereal (test account) if no SMTP env vars are set.
 */
const createTransporter = async () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });
  }

  // Ethereal fallback for development
  const testAccount = await nodemailer.createTestAccount();
  console.log('📧 Using Ethereal test email account:', testAccount.user);

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

let transporter = null;

const getTransporter = async () => {
  if (!transporter) {
    transporter = await createTransporter();
  }
  return transporter;
};

module.exports = { getTransporter };
