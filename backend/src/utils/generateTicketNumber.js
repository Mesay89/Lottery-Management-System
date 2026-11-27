'use strict';

const { customAlphabet } = require('nanoid');

// Alphabet: uppercase letters + digits (excluding visually ambiguous chars)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const nanoid   = customAlphabet(ALPHABET, 6);

/**
 * Generate a unique ticket number in the format: TKT-YYYYMMDD-XXXXXX
 * @returns {string} e.g. "TKT-20241201-A3B2C9"
 */
const generateTicketNumber = () => {
  const now  = new Date();
  const yyyy = now.getFullYear();
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  const datePart = `${yyyy}${mm}${dd}`;
  const randPart = nanoid();
  return `TKT-${datePart}-${randPart}`;
};

module.exports = { generateTicketNumber };
