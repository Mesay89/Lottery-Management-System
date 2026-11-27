'use strict';

const Transaction = require('../models/Transaction');
const Ticket = require('../models/Ticket');
const LotteryEvent = require('../models/LotteryEvent');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paymentService = require('../services/payment.service');
const telebirrService = require('../services/telebirr.service');
const cbeService = require('../services/cbe.service');
const { generateTransactionRef } = require('../utils/generateTransactionRef');

const createTransaction = asyncHandler(async (req, res) => {
  const { type, lotteryEvent, ticket, amount, paymentMethod, idempotencyKey, metadata } = req.body;
  const key = idempotencyKey || req.headers['x-idempotency-key'] || generateTransactionRef();

  const existing = await Transaction.findOne({ idempotencyKey: key });
  if (existing) {
    return ApiResponse.success(res, existing, 'Transaction already processed (idempotent).');
  }

  const transaction = await Transaction.create({
    transactionRef: generateTransactionRef(),
    type: type || 'ticket_purchase',
    customer: req.user._id,
    lotteryEvent,
    ticket,
    amount,
    currency: 'ETB',
    paymentMethod,
    status: paymentMethod === 'cash' ? 'Completed' : 'Pending',
    idempotencyKey: key,
    metadata,
    processedBy: req.user._id,
    processedAt: paymentMethod === 'cash' ? new Date() : undefined,
  });

  return ApiResponse.created(res, transaction, 'Transaction recorded.');
});

const getAllTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('customer', 'firstName lastName email phone')
      .populate('lotteryEvent', 'name eventId')
      .populate('ticket', 'ticketNumber'),
    Transaction.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  return ApiResponse.paginated(res, transactions, {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  });
});

const getMyTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find({ customer: req.user._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('lotteryEvent', 'name eventId')
      .populate('ticket', 'ticketNumber'),
    Transaction.countDocuments({ customer: req.user._id }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return ApiResponse.paginated(res, transactions, {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  });
});

const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('customer', 'firstName lastName email phone')
    .populate('lotteryEvent', 'name eventId')
    .populate('ticket', 'ticketNumber');
  if (!transaction) return ApiResponse.error(res, 'Transaction not found.', 404);
  return ApiResponse.success(res, transaction);
});

const OWNER_ACCOUNTS = {
  telebirr: process.env.OWNER_TELEBIRR_ACCOUNT || '0939648955',
  cbe: process.env.OWNER_CBE_ACCOUNT || '1000475739098',
};

const recordManualMobilePayment = async ({
  method,
  amount,
  phone,
  externalRef,
  screenshotUrl,
  eventId,
  ticketId,
  userId,
}) => {
  const txnRef = generateTransactionRef();
  const receiverAccount = OWNER_ACCOUNTS[method];
  const submittedRef = externalRef?.trim() || undefined;
  const refField = submittedRef
    ? (method === 'telebirr' ? { telebirrRef: submittedRef } : { cbeRef: submittedRef })
    : {};

  const transaction = await Transaction.create({
    transactionRef: txnRef,
    type: 'ticket_purchase',
    customer: userId,
    lotteryEvent: eventId || undefined,
    ticket: ticketId || undefined,
    amount: Number(amount),
    currency: 'ETB',
    paymentMethod: method,
    status: 'Pending',
    ...refField,
    externalRef: submittedRef,
    screenshotUrl,
    idempotencyKey: txnRef,
    metadata: {
      transferMode: 'manual_owner_account',
      senderPhone: phone,
      receiverAccount,
      submittedRef,
      screenshotUrl,
    },
  });

  return {
    transaction,
    manualTransfer: {
      receiverAccount,
      senderPhone: phone,
      reference: submittedRef,
      screenshotUrl,
    },
  };
};

const syncLinkedTicketOnVerification = async (transaction, nextStatus) => {
  const ticket = transaction.ticket
    ? await Ticket.findById(transaction.ticket)
    : await Ticket.findOne({ transactionRef: transaction.transactionRef });

  if (!ticket) return null;

  if (nextStatus === 'Completed' && ticket.status === 'Pending') {
    ticket.status = 'Valid';
    await ticket.save();
  } else if (nextStatus === 'Failed' && ticket.status !== 'Cancelled') {
    ticket.status = 'Cancelled';
    await ticket.save();

    if (ticket.lotteryEvent) {
      const event = await LotteryEvent.findById(ticket.lotteryEvent);
      if (event) {
        event.soldTickets = Math.max(0, event.soldTickets - 1);
        event.remainingTickets = Math.max(0, event.totalTickets - event.soldTickets);
        await event.save();
      }
    }
  }

  return ticket;
};

const verifyTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) return ApiResponse.error(res, 'Transaction not found.', 404);

  const requestedStatus = req.body?.status;
  if (requestedStatus === 'Completed' || requestedStatus === 'Failed') {
    if (requestedStatus === 'Failed' && !req.body?.failureReason?.trim()) {
      return ApiResponse.error(res, 'Rejection reason is required.', 400);
    }

    transaction.status = requestedStatus;
    transaction.processedBy = req.user._id;
    transaction.processedAt = new Date();
    if (requestedStatus === 'Failed') {
      transaction.failureReason = req.body.failureReason.trim();
    } else {
      transaction.failureReason = undefined;
    }
    await transaction.save();

    const updatedTicket = await syncLinkedTicketOnVerification(transaction, requestedStatus);
    return ApiResponse.success(
      res,
      { transaction, ticket: updatedTicket },
      requestedStatus === 'Completed'
        ? 'Payment approved and ticket activated.'
        : 'Payment rejected and ticket cancelled.'
    );
  }

  let verifyResult = null;
  if (transaction.paymentMethod === 'telebirr' && telebirrService.verifyPayment) {
    verifyResult = await telebirrService.verifyPayment(transaction.transactionRef).catch(() => null);
  } else if (transaction.paymentMethod === 'cbe' && cbeService.verifyPayment) {
    verifyResult = await cbeService.verifyPayment(transaction.transactionRef).catch(() => null);
  }

  return ApiResponse.success(res, { transaction, providerVerification: verifyResult });
});

const handleManualPaymentInitiation = async (method, req, res) => {
  const { amount, phone, externalRef, eventId, ticketId } = req.body;
  const screenshotUrl = req.file ? `/api/uploads/payment-proofs/${req.file.filename}` : undefined;
  const senderPhone = phone?.trim() || req.user?.phone || undefined;

  if (!externalRef?.trim() && !screenshotUrl) {
    return ApiResponse.error(
      res,
      'Please provide either a Transaction ID or upload a payment screenshot.',
      400
    );
  }

  const result = await recordManualMobilePayment({
    method,
    amount,
    phone: senderPhone,
    externalRef,
    screenshotUrl,
    eventId,
    ticketId,
    userId: req.user._id,
  });

  const label = method === 'telebirr' ? 'Telebirr' : 'CBE';
  return ApiResponse.created(
    res,
    result,
    `${label} payment proof submitted. Awaiting Cash Manager approval.`
  );
};

const initiateTelebirrPayment = asyncHandler(async (req, res) => {
  return handleManualPaymentInitiation('telebirr', req, res);
});

const initiateCBEPayment = asyncHandler(async (req, res) => {
  return handleManualPaymentInitiation('cbe', req, res);
});

const handleTelebirrCallback = asyncHandler(async (req, res) => {
  const transaction = await paymentService.processCallback({
    method: 'telebirr',
    payload: req.body,
  });
  return ApiResponse.success(res, transaction, 'Telebirr callback processed.');
});

const handleCBECallback = asyncHandler(async (req, res) => {
  const transaction = await paymentService.processCallback({
    method: 'cbe',
    payload: req.body,
  });
  return ApiResponse.success(res, transaction, 'CBE callback processed.');
});

module.exports = {
  createTransaction,
  getAllTransactions,
  getMyTransactions,
  getTransactionById,
  verifyTransaction,
  initiateTelebirrPayment,
  initiateCBEPayment,
  handleTelebirrCallback,
  handleCBECallback,
};
