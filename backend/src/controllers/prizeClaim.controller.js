'use strict';

const PrizeClaim = require('../models/PrizeClaim');
const Winner = require('../models/Winner');
const Transaction = require('../models/Transaction');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notification.service');

const submitClaim = asyncHandler(async (req, res) => {
  const { winnerId, claimantDetails, paymentMethod, documents, notes } = req.body;

  const winner = await Winner.findById(winnerId);
  if (!winner) return ApiResponse.error(res, 'Winner record not found.', 404);

  if (String(winner.customer) !== String(req.user._id)) {
    return ApiResponse.error(res, 'You are not authorized to claim this prize.', 403);
  }

  if (winner.claimStatus === 'Claimed') {
    return ApiResponse.error(res, 'A claim has already been submitted for this winning ticket.', 409);
  }

  const existing = await PrizeClaim.findOne({ winner: winner._id });
  if (existing) {
    return ApiResponse.error(res, 'Duplicate prize claim is not allowed.', 409);
  }

  const claimReference = `CLM-${Date.now().toString(36).toUpperCase()}`;

  const claim = await PrizeClaim.create({
    claimReference,
    winner: winner._id,
    customer: req.user._id,
    lotteryEvent: winner.lotteryEvent,
    ticket: winner.ticket,
    status: 'Submitted',
    submittedAt: new Date(),
    claimantDetails,
    paymentMethod,
    documents: documents || [],
    notes,
  });

  winner.claimStatus = 'Claimed';
  await winner.save();

  return ApiResponse.created(res, claim, 'Prize claim submitted successfully.');
});

const getMyClaims = asyncHandler(async (req, res) => {
  const claims = await PrizeClaim.find({ customer: req.user._id })
    .sort('-createdAt')
    .populate('lotteryEvent', 'name eventId')
    .populate('ticket', 'ticketNumber prizeAmount prizeRank')
    .populate('winner', 'prizeRank prizeAmount currency');
  return ApiResponse.success(res, claims);
});

const getAllClaims = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.lotteryEvent) filter.lotteryEvent = req.query.lotteryEvent;

  const [claims, total] = await Promise.all([
    PrizeClaim.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('customer', 'firstName lastName email phone')
      .populate('lotteryEvent', 'name eventId')
      .populate('ticket', 'ticketNumber prizeAmount')
      .populate('winner', 'prizeRank prizeAmount currency'),
    PrizeClaim.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  return ApiResponse.paginated(res, claims, {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  });
});

const getClaimById = asyncHandler(async (req, res) => {
  const claim = await PrizeClaim.findById(req.params.id)
    .populate('customer', 'firstName lastName email phone')
    .populate('lotteryEvent')
    .populate('ticket')
    .populate('winner')
    .populate('reviewedBy approvedBy paidBy', 'firstName lastName');
  if (!claim) return ApiResponse.error(res, 'Prize claim not found.', 404);
  return ApiResponse.success(res, claim);
});

const reviewClaim = asyncHandler(async (req, res) => {
  const claim = await PrizeClaim.findById(req.params.id);
  if (!claim) return ApiResponse.error(res, 'Prize claim not found.', 404);

  claim.status = 'Under Review';
  claim.reviewedBy = req.user._id;
  claim.reviewedAt = new Date();
  if (req.body.notes) claim.notes = req.body.notes;
  await claim.save();

  if (notificationService.notifyClaimUpdate) {
    notificationService.notifyClaimUpdate(claim._id).catch(() => {});
  }

  return ApiResponse.success(res, claim, 'Prize claim marked as Under Review.');
});

const approveClaim = asyncHandler(async (req, res) => {
  const claim = await PrizeClaim.findById(req.params.id);
  if (!claim) return ApiResponse.error(res, 'Prize claim not found.', 404);

  claim.status = 'Approved';
  claim.approvedBy = req.user._id;
  claim.approvedAt = new Date();
  await claim.save();

  if (notificationService.notifyClaimUpdate) {
    notificationService.notifyClaimUpdate(claim._id).catch(() => {});
  }

  return ApiResponse.success(res, claim, 'Prize claim approved.');
});

const rejectClaim = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  const claim = await PrizeClaim.findById(req.params.id);
  if (!claim) return ApiResponse.error(res, 'Prize claim not found.', 404);

  claim.status = 'Rejected';
  claim.rejectionReason = rejectionReason;
  claim.reviewedBy = req.user._id;
  claim.reviewedAt = new Date();
  await claim.save();

  if (notificationService.notifyClaimUpdate) {
    notificationService.notifyClaimUpdate(claim._id).catch(() => {});
  }

  return ApiResponse.success(res, claim, 'Prize claim rejected.');
});

const markAsPaid = asyncHandler(async (req, res) => {
  const { paymentReference } = req.body;
  const claim = await PrizeClaim.findById(req.params.id).populate('winner');
  if (!claim) return ApiResponse.error(res, 'Prize claim not found.', 404);

  if (claim.status !== 'Approved') {
    return ApiResponse.error(res, 'Claim must be Approved before marking as Paid.', 400);
  }

  // Verify or create transaction record (BR-09)
  let txn = await Transaction.findOne({ transactionRef: paymentReference });
  if (!txn) {
    txn = await Transaction.create({
      transactionRef: paymentReference,
      type: 'prize_payment',
      customer: claim.customer,
      lotteryEvent: claim.lotteryEvent,
      ticket: claim.ticket,
      amount: claim.winner?.prizeAmount || 0,
      currency: 'ETB',
      paymentMethod: claim.paymentMethod || 'bank_transfer',
      status: 'Completed',
      idempotencyKey: `PAY-${claim.claimReference}`,
      processedBy: req.user._id,
      processedAt: new Date(),
    });
  }

  claim.status = 'Paid';
  claim.paymentReference = paymentReference;
  claim.paidBy = req.user._id;
  claim.paidAt = new Date();
  await claim.save();

  if (notificationService.notifyClaimUpdate) {
    notificationService.notifyClaimUpdate(claim._id).catch(() => {});
  }

  return ApiResponse.success(res, { claim, transaction: txn }, 'Prize claim marked as Paid.');
});

module.exports = {
  submitClaim,
  getMyClaims,
  getAllClaims,
  getClaimById,
  reviewClaim,
  approveClaim,
  rejectClaim,
  markAsPaid,
};
