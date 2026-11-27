'use strict';

const nodemailer = require('nodemailer');
const { getTransporter } = require('../config/email');

const FROM = process.env.EMAIL_FROM || '"OLMS System" <noreply@olms.com>';

// ─── HTML Base Template ───────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.1); }
    .header { background: #1a237e; color: #fff; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 22px; }
    .body { padding: 32px; color: #333; line-height: 1.6; }
    .btn { display: inline-block; margin: 20px 0; padding: 12px 28px; background: #1a237e; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold; }
    .footer { background: #f9f9f9; color: #888; font-size: 12px; text-align: center; padding: 16px 32px; border-top: 1px solid #eee; }
    .ticket-box { background: #f0f4ff; border: 1px solid #c5cae9; border-radius: 6px; padding: 16px; margin: 16px 0; font-size: 20px; font-weight: bold; text-align: center; letter-spacing: 2px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #eee; }
    th { background: #f5f5f5; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🎟️ OLMS – Lottery Management System</h1></div>
    <div class="body">${content}</div>
    <div class="footer">© ${new Date().getFullYear()} OLMS. All rights reserved. | This is an automated message.</div>
  </div>
</body>
</html>`;

// ─── Send Helper ──────────────────────────────────────────────────────────────
const sendMail = async ({ to, subject, html }) => {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({ from: FROM, to, subject, html });
    if (process.env.NODE_ENV !== 'production') {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log('📧 Email preview URL:', preview);
    }
    return info;
  } catch (err) {
    console.error('Email send error:', err.message);
    throw err;
  }
};

// ─── Welcome Email ────────────────────────────────────────────────────────────
const sendWelcomeEmail = async (user) => {
  const html = baseTemplate(`
    <p>Hi <strong>${user.firstName}</strong>,</p>
    <p>Welcome to <strong>OLMS</strong>! Your account has been successfully created.</p>
    <table>
      <tr><th>Name</th><td>${user.firstName} ${user.lastName}</td></tr>
      <tr><th>Email</th><td>${user.email}</td></tr>
      <tr><th>Role</th><td>${user.role}</td></tr>
    </table>
    <p>You can now log in and start exploring available lottery events.</p>
    <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">Login to OLMS</a>
    <p>If you did not create this account, please contact our support team immediately.</p>
  `);
  return sendMail({ to: user.email, subject: 'Welcome to OLMS!', html });
};

// ─── Password Reset Email ─────────────────────────────────────────────────────
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const html = baseTemplate(`
    <p>Hi <strong>${user.firstName}</strong>,</p>
    <p>You requested a password reset for your OLMS account. Click the button below to reset your password:</p>
    <a class="btn" href="${resetUrl}">Reset Password</a>
    <p>This link expires in <strong>1 hour</strong>.</p>
    <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
    <p><small>Or copy this link: ${resetUrl}</small></p>
  `);
  return sendMail({ to: user.email, subject: 'OLMS – Password Reset Request', html });
};

// ─── Ticket Confirmation Email ────────────────────────────────────────────────
const sendTicketConfirmationEmail = async (user, ticket, event) => {
  const html = baseTemplate(`
    <p>Hi <strong>${user.firstName}</strong>,</p>
    <p>Your ticket for <strong>${event.name}</strong> has been successfully registered.</p>
    <div class="ticket-box">${ticket.ticketNumber}</div>
    <table>
      <tr><th>Event</th><td>${event.name}</td></tr>
      <tr><th>Ticket Number</th><td>${ticket.ticketNumber}</td></tr>
      <tr><th>Purchase Date</th><td>${new Date(ticket.purchaseDate).toLocaleDateString()}</td></tr>
      <tr><th>Draw Date</th><td>${new Date(event.drawDate).toLocaleDateString()}</td></tr>
      <tr><th>Ticket Price</th><td>ETB ${event.ticketPrice.toLocaleString()}</td></tr>
    </table>
    <p>Keep your ticket number safe. Good luck! 🍀</p>
  `);
  return sendMail({ to: user.email, subject: `OLMS – Ticket Confirmation: ${ticket.ticketNumber}`, html });
};

// ─── Results Published Email ──────────────────────────────────────────────────
const sendResultsPublishedEmail = async (user, event) => {
  const html = baseTemplate(`
    <p>Hi <strong>${user.firstName}</strong>,</p>
    <p>The results for <strong>${event.name}</strong> have been published!</p>
    <p>Check your tickets against the winning numbers by logging into your account.</p>
    <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/results">View Results</a>
  `);
  return sendMail({ to: user.email, subject: `OLMS – Results Published: ${event.name}`, html });
};

// ─── Winner Notification Email ────────────────────────────────────────────────
const sendWinnerNotificationEmail = async (user, winner, event) => {
  const html = baseTemplate(`
    <p>Hi <strong>${user.firstName}</strong>,</p>
    <p>🎉 <strong>Congratulations!</strong> You are a winner in the <strong>${event.name}</strong> lottery!</p>
    <table>
      <tr><th>Prize Rank</th><td>${winner.prizeRank}</td></tr>
      <tr><th>Prize Amount</th><td>${winner.currency} ${winner.prizeAmount.toLocaleString()}</td></tr>
      <tr><th>Claim Status</th><td>${winner.claimStatus}</td></tr>
    </table>
    <p>Please log in to submit your prize claim as soon as possible.</p>
    <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-winnings">Claim Your Prize</a>
    <p><strong>Note:</strong> Prize claims must be submitted within 90 days of announcement.</p>
  `);
  return sendMail({ to: user.email, subject: `OLMS – 🎉 You're a Winner! ${event.name}`, html });
};

// ─── Prize Claim Update Email ─────────────────────────────────────────────────
const sendPrizeClaimUpdateEmail = async (user, claim) => {
  const statusMessages = {
    'Under Review': 'Your prize claim is now under review. We will notify you once the review is complete.',
    'Approved':     'Your prize claim has been APPROVED! Payment will be processed shortly.',
    'Rejected':     `Your prize claim has been rejected. Reason: ${claim.rejectionReason || 'Please contact support.'}`,
    'Paid':         'Your prize payment has been processed! Please check your payment method.',
  };
  const statusMsg = statusMessages[claim.status] || `Your claim status has been updated to: ${claim.status}`;
  const html = baseTemplate(`
    <p>Hi <strong>${user.firstName}</strong>,</p>
    <p>${statusMsg}</p>
    <table>
      <tr><th>Claim Reference</th><td>${claim.claimReference}</td></tr>
      <tr><th>Status</th><td>${claim.status}</td></tr>
    </table>
    <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-claims">View My Claims</a>
  `);
  return sendMail({ to: user.email, subject: `OLMS – Prize Claim Update: ${claim.claimReference}`, html });
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendTicketConfirmationEmail,
  sendResultsPublishedEmail,
  sendWinnerNotificationEmail,
  sendPrizeClaimUpdateEmail,
};
