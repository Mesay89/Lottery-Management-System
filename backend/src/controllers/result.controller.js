'use strict';

const Result = require('../models/Result');
const LotteryEvent = require('../models/LotteryEvent');
const Winner = require('../models/Winner');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notification.service');

const createResult = asyncHandler(async (req, res) => {
  const { lotteryEvent, draw, winningNumbers, prizeBreakdown, notes } = req.body;
  const resultId = `RES-${Date.now().toString(36).toUpperCase()}`;

  const result = await Result.create({
    resultId,
    lotteryEvent,
    draw,
    winningNumbers: winningNumbers || [],
    prizeBreakdown: prizeBreakdown || [],
    notes,
    status: 'Draft',
  });

  return ApiResponse.created(res, result, 'Result draft created.');
});

const publishResult = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id);
  if (!result) return ApiResponse.error(res, 'Result not found.', 404);

  result.status = 'Published';
  result.publishedBy = req.user._id;
  result.publishedAt = new Date();
  result.approvedBy = result.approvedBy || req.user._id;
  result.approvedAt = result.approvedAt || new Date();
  await result.save();

  await LotteryEvent.findByIdAndUpdate(result.lotteryEvent, { status: 'Published' });

  if (notificationService.notifyResultPublished) {
    notificationService.notifyResultPublished(result.lotteryEvent).catch(() => {});
  }
  if (notificationService.notifyWinners) {
    notificationService.notifyWinners(result.lotteryEvent).catch(() => {});
  }

  return ApiResponse.success(res, result, 'Official results published successfully.');
});

const getAllResults = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = {};
  const isAdmin = req.user && ['superAdmin', 'lotteryAdmin'].includes(req.user.role);
  if (!isAdmin) {
    filter.status = 'Published';
  } else if (req.query.status) {
    filter.status = req.query.status;
  }

  const [results, total] = await Promise.all([
    Result.find(filter)
      .sort('-publishedAt -createdAt')
      .skip(skip)
      .limit(limit)
      .populate('lotteryEvent', 'name eventId drawDate ticketPrice prizeStructure')
      .populate('draw', 'drawId scheduledDate actualDate winningNumbers')
      .populate('publishedBy', 'firstName lastName'),
    Result.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  return ApiResponse.paginated(res, results, {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  });
});

const getResultById = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id)
    .populate('lotteryEvent')
    .populate('draw')
    .populate('publishedBy', 'firstName lastName');
  if (!result) return ApiResponse.error(res, 'Result not found.', 404);

  const winners = await Winner.find({ result: result._id })
    .populate('ticket', 'ticketNumber ownerName')
    .select('winnerId prizeRank prizeAmount currency verificationStatus claimStatus ticket');

  return ApiResponse.success(res, { result, winners });
});

const getResultByEvent = asyncHandler(async (req, res) => {
  const result = await Result.findOne({ lotteryEvent: req.params.eventId })
    .populate('lotteryEvent')
    .populate('draw');
  if (!result) return ApiResponse.error(res, 'Result not found for this event.', 404);

  const winners = await Winner.find({ result: result._id }).populate('ticket', 'ticketNumber ownerName');
  return ApiResponse.success(res, { result, winners });
});

module.exports = {
  createResult,
  publishResult,
  getAllResults,
  getResultById,
  getResultByEvent,
};
