'use strict';

const telebirrService = require('./telebirr.service');
const cbeService      = require('./cbe.service');
const Transaction     = require('../models/Transaction');
const { generateTransactionRef } = require('../utils/generateTransactionRef');

/**
 * Dispatch payment initiation to the correct provider.
 */
const initiatePayment = async ({ method, amount, phone, description, eventId, ticketId, userId }) => {
  const transactionRef = generateTransactionRef();

  // Create a pending transaction record
  const transaction = await Transaction.create({
    transactionRef,
    type:          'ticket_purchase',
    customer:      userId,
    lotteryEvent:  eventId,
    ticket:        ticketId,
    amount,
    currency:      'ETB',
    paymentMethod: method,
    status:        'Pending',
    idempotencyKey: transactionRef,
  });

  let result;
  if (method === 'telebirr') {
    result = await telebirrService.initiatePayment({ amount, phone, transactionRef, description });
  } else if (method === 'cbe') {
    result = await cbeService.initiatePayment({ amount, phone, transactionRef, description });
  } else {
    throw new Error(`Unsupported payment method: ${method}`);
  }

  return { transaction, paymentResult: result };
};

/**
 * Process a payment callback from a provider and update the transaction.
 */
const processCallback = async ({ method, payload }) => {
  let parsed;
  if (method === 'telebirr') {
    parsed = telebirrService.handleCallback(payload);
  } else if (method === 'cbe') {
    parsed = cbeService.handleCallback(payload);
  } else {
    throw new Error(`Unknown payment callback method: ${method}`);
  }

  const transaction = await Transaction.findOne({ transactionRef: parsed.transactionRef });
  if (!transaction) throw new Error(`Transaction not found: ${parsed.transactionRef}`);

  transaction.status      = parsed.status;
  transaction.processedAt = new Date();
  if (method === 'telebirr') transaction.telebirrRef = parsed.telebirrRef;
  if (method === 'cbe')      transaction.cbeRef      = parsed.cbeRef;
  await transaction.save();

  return transaction;
};

module.exports = { initiatePayment, processCallback };
