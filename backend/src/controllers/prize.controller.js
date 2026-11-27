'use strict';

const Prize = require('../models/Prize');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createPrize = asyncHandler(async (req, res) => {
  const prize = await Prize.create(req.body);
  return ApiResponse.created(res, prize, 'Prize created successfully.');
});

const getPrizesByEvent = asyncHandler(async (req, res) => {
  const prizes = await Prize.find({ lotteryEvent: req.params.eventId }).sort('rank');
  return ApiResponse.success(res, prizes);
});

const updatePrize = asyncHandler(async (req, res) => {
  const prize = await Prize.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!prize) return ApiResponse.error(res, 'Prize not found.', 404);
  return ApiResponse.success(res, prize, 'Prize updated successfully.');
});

const deletePrize = asyncHandler(async (req, res) => {
  const prize = await Prize.findByIdAndDelete(req.params.id);
  if (!prize) return ApiResponse.error(res, 'Prize not found.', 404);
  return ApiResponse.success(res, null, 'Prize deleted.');
});

module.exports = {
  createPrize,
  getPrizesByEvent,
  updatePrize,
  deletePrize,
};
