'use strict';

const { customAlphabet } = require('nanoid');

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
const nanoid   = customAlphabet(ALPHABET, 10);

/**
 * Generate a unique transaction reference in the format: TXN-YYYYMMDD-XXXXXXXXXX
 * @returns {string} e.g. "TXN-20241201-A3B2C9D4E5"
 */
const generateTransactionRef = () => {
  const now  = new Date();
  const yyyy = now.getFullYear();
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  const datePart = `${yyyy}${mm}${dd}`;
  const randPart = nanoid();
  return `TXN-${datePart}-${randPart}`;
};

module.exports = { generateTransactionRef };
