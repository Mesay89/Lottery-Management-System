'use strict';

const PDFDocument = require('pdfkit');
const Ticket      = require('../models/Ticket');
const LotteryEvent = require('../models/LotteryEvent');
const { generateTicketNumber: genNum } = require('../utils/generateTicketNumber');

/**
 * Generate a unique ticket number, retrying on collision.
 */
const generateTicketNumber = async (maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    const num = genNum();
    const exists = await Ticket.exists({ ticketNumber: num });
    if (!exists) return num;
  }
  throw new Error('Could not generate a unique ticket number after multiple attempts.');
};

/**
 * Validate that a ticket is eligible (exists, belongs to event, is Valid status).
 */
const validateTicketEligibility = async (ticketId, eventId) => {
  const ticket = await Ticket.findById(ticketId).populate('lotteryEvent');
  if (!ticket) return { valid: false, reason: 'Ticket not found.' };
  if (String(ticket.lotteryEvent._id) !== String(eventId)) return { valid: false, reason: 'Ticket does not belong to this event.' };
  if (ticket.status !== 'Valid') return { valid: false, reason: `Ticket status is ${ticket.status}.` };
  return { valid: true, ticket };
};

/**
 * Generate a PDF receipt for a ticket purchase.
 * @returns {Promise<Buffer>}
 */
const generateReceiptPDF = (ticket, event, user) => {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 50, size: 'A5' });
    const chunks = [];

    doc.on('data',  (c) => chunks.push(c));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.rect(0, 0, doc.page.width, 80).fill('#1a237e');
    doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('OLMS – TICKET RECEIPT', 50, 25, { align: 'center' });

    // Body
    doc.fillColor('#333333').fontSize(11).font('Helvetica').moveDown(2);

    const drawY = (label, value, y) => {
      doc.font('Helvetica-Bold').text(label, 50, y);
      doc.font('Helvetica').text(String(value), 220, y);
    };

    let y = 100;
    drawY('Receipt Date:',    new Date().toLocaleString(), y); y += 22;
    drawY('Ticket Number:',   ticket.ticketNumber,          y); y += 22;
    drawY('Event:',           event ? event.name : 'N/A',  y); y += 22;
    drawY('Draw Date:',       event ? new Date(event.drawDate).toLocaleDateString() : 'N/A', y); y += 22;
    drawY('Owner:',           ticket.ownerName || (user ? `${user.firstName} ${user.lastName}` : 'N/A'), y); y += 22;
    drawY('Email:',           ticket.ownerEmail || (user ? user.email : 'N/A'), y); y += 22;
    drawY('Phone:',           ticket.ownerPhone || (user ? user.phone : 'N/A'), y); y += 22;
    drawY('Ticket Price:',    `ETB ${event ? event.ticketPrice.toLocaleString() : 'N/A'}`, y); y += 22;
    drawY('Payment Channel:', ticket.purchaseChannel, y); y += 22;
    drawY('Status:',          ticket.status, y); y += 30;

    // Ticket Number Box
    doc.rect(50, y, doc.page.width - 100, 50).stroke('#1a237e');
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1a237e').text(ticket.ticketNumber, 50, y + 15, { align: 'center' });

    // Footer
    doc.fontSize(9).font('Helvetica').fillColor('#888888').text(
      'This receipt is proof of your ticket purchase. Keep this document safe. Good luck!',
      50, doc.page.height - 60, { align: 'center', width: doc.page.width - 100 }
    );

    doc.end();
  });
};

module.exports = { generateTicketNumber, validateTicketEligibility, generateReceiptPDF };
