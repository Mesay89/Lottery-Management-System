'use strict';

const Draw = require('../models/Draw');
const LotteryEvent = require('../models/LotteryEvent');
const Result = require('../models/Result');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const drawService = require('../services/draw.service');

const scheduleDraw = asyncHandler(async (req, res) => {
  const { lotteryEvent: eventId, scheduledDate, drawMethod, witnessedBy, notes } = req.body;

  const event = await LotteryEvent.findById(eventId);
  if (!event) return ApiResponse.error(res, 'Lottery event not found.', 404);

  const drawId = `DRW-${Date.now().toString(36).toUpperCase()}`;
  const draw = await Draw.create({
    drawId,
    lotteryEvent: event._id,
    scheduledDate,
    drawMethod: drawMethod || 'random',
    witnessedBy: witnessedBy || [],
    notes,
    status: 'Scheduled',
    conductedBy: req.user._id,
  });

  return ApiResponse.created(res, draw, 'Draw scheduled successfully.');
});

const getAllDraws = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.lotteryEvent) filter.lotteryEvent = req.query.lotteryEvent;
  if (req.query.status) filter.status = req.query.status;

  const [draws, total] = await Promise.all([
    Draw.find(filter)
      .sort('-scheduledDate')
      .skip(skip)
      .limit(limit)
      .populate('lotteryEvent', 'name eventId status drawDate')
      .populate('conductedBy', 'firstName lastName email'),
    Draw.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  return ApiResponse.paginated(res, draws, {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  });
});

const getDrawById = asyncHandler(async (req, res) => {
  const draw = await Draw.findById(req.params.id)
    .populate('lotteryEvent')
    .populate('conductedBy', 'firstName lastName email')
    .populate('winningTickets', 'ticketNumber ownerName ownerPhone prizeRank prizeAmount');
  if (!draw) return ApiResponse.error(res, 'Draw not found.', 404);
  return ApiResponse.success(res, draw);
});

const startDraw = asyncHandler(async (req, res) => {
  const draw = await Draw.findById(req.params.id);
  if (!draw) return ApiResponse.error(res, 'Draw not found.', 404);
  if (draw.status !== 'Scheduled') {
    return ApiResponse.error(res, `Cannot start draw with status ${draw.status}.`, 400);
  }
  draw.status = 'InProgress';
  draw.actualDate = new Date();
  await draw.save();
  return ApiResponse.success(res, draw, 'Draw is now in progress.');
});

const recordDrawResults = asyncHandler(async (req, res) => {
  const { winningNumbers, winningTickets, notes } = req.body;
  const draw = await Draw.findById(req.params.id);
  if (!draw) return ApiResponse.error(res, 'Draw not found.', 404);

  const event = await LotteryEvent.findById(draw.lotteryEvent);
  if (!event) return ApiResponse.error(res, 'Associated event not found.', 404);

  let selectedTickets = winningTickets;
  if ((!selectedTickets || selectedTickets.length === 0) && draw.drawMethod === 'random') {
    const count = Math.max(1, event.prizeStructure?.length || 3);
    const picked = await drawService.selectWinningTickets(event._id, count);
    selectedTickets = picked.map((t) => t._id);
  }

  draw.winningNumbers = winningNumbers || draw.winningNumbers;
  draw.winningTickets = selectedTickets || draw.winningTickets;
  if (notes) draw.notes = notes;
  draw.actualDate = draw.actualDate || new Date();
  await draw.save();

  return ApiResponse.success(res, draw, 'Draw results recorded.');
});

const completeDraw = asyncHandler(async (req, res) => {
  const draw = await Draw.findById(req.params.id);
  if (!draw) return ApiResponse.error(res, 'Draw not found.', 404);

  const event = await LotteryEvent.findById(draw.lotteryEvent);
  if (!event) return ApiResponse.error(res, 'Associated event not found.', 404);

  // Auto-select if random and not yet picked
  if ((!draw.winningTickets || draw.winningTickets.length === 0) && draw.drawMethod !== 'manual') {
    const count = Math.max(1, event.prizeStructure?.length || 3);
    const picked = await drawService.selectWinningTickets(event._id, count);
    draw.winningTickets = picked.map((t) => t._id);
  }

  draw.status = 'Completed';
  draw.actualDate = draw.actualDate || new Date();
  await draw.save();

  event.status = 'Drawn';
  await event.save();

  const resultId = `RES-${Date.now().toString(36).toUpperCase()}`;
  const result = await Result.create({
    resultId,
    lotteryEvent: event._id,
    draw: draw._id,
    winningNumbers: draw.winningNumbers || [],
    status: 'Draft',
    totalWinners: draw.winningTickets.length,
  });

  const winners = await drawService.identifyAndPersistWinners(draw, result, event);

  return ApiResponse.success(res, { draw, result, winnersCount: winners.length }, 'Draw completed and winners identified.');
});

const cancelDraw = asyncHandler(async (req, res) => {
  const draw = await Draw.findByIdAndUpdate(req.params.id, { status: 'Cancelled' }, { new: true });
  if (!draw) return ApiResponse.error(res, 'Draw not found.', 404);
  return ApiResponse.success(res, draw, 'Draw cancelled.');
});

module.exports = {
  scheduleDraw,
  getAllDraws,
  getDrawById,
  startDraw,
  recordDrawResults,
  completeDraw,
  cancelDraw,
};
