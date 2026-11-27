'use strict';

const Winner = require('../models/Winner');
const Draw = require('../models/Draw');
const Result = require('../models/Result');
const LotteryEvent = require('../models/LotteryEvent');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const drawService = require('../services/draw.service');

const identifyWinners = asyncHandler(async (req, res) => {
  const { drawId, resultId } = req.body;
  const draw = await Draw.findById(drawId);
  if (!draw) return ApiResponse.error(res, 'Draw not found.', 404);
  const result = await Result.findById(resultId);
  if (!result) return ApiResponse.error(res, 'Result not found.', 404);
  const event = await LotteryEvent.findById(draw.lotteryEvent);
  if (!event) return ApiResponse.error(res, 'Event not found.', 404);

  const winners = await drawService.identifyAndPersistWinners(draw, result, event);
  return ApiResponse.success(res, winners, `${winners.length} winners identified.`);
});

const getAllWinners = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.lotteryEvent) filter.lotteryEvent = req.query.lotteryEvent;
  if (req.query.verificationStatus) filter.verificationStatus = req.query.verificationStatus;
  if (req.query.claimStatus) filter.claimStatus = req.query.claimStatus;

  const [winners, total] = await Promise.all([
    Winner.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('lotteryEvent', 'name eventId drawDate')
      .populate('ticket', 'ticketNumber ownerName ownerPhone')
      .populate('customer', 'firstName lastName email phone'),
    Winner.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  return ApiResponse.paginated(res, winners, {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  });
});

const getWinnerById = asyncHandler(async (req, res) => {
  const winner = await Winner.findById(req.params.id)
    .populate('lotteryEvent')
    .populate('ticket')
    .populate('customer', 'firstName lastName email phone');
  if (!winner) return ApiResponse.error(res, 'Winner record not found.', 404);
  return ApiResponse.success(res, winner);
});

const verifyWinner = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'Verified' or 'Rejected'
  const winner = await Winner.findById(req.params.id);
  if (!winner) return ApiResponse.error(res, 'Winner record not found.', 404);

  winner.verificationStatus = status || 'Verified';
  winner.verifiedBy = req.user._id;
  winner.verifiedAt = new Date();
  await winner.save();

  return ApiResponse.success(res, winner, `Winner ${winner.verificationStatus.toLowerCase()} successfully.`);
});

const getMyWinnings = asyncHandler(async (req, res) => {
  const winners = await Winner.find({ customer: req.user._id })
    .sort('-createdAt')
    .populate('lotteryEvent', 'name eventId drawDate')
    .populate('ticket', 'ticketNumber status');
  return ApiResponse.success(res, winners);
});

module.exports = {
  identifyWinners,
  getAllWinners,
  getWinnerById,
  verifyWinner,
  getMyWinnings,
};
