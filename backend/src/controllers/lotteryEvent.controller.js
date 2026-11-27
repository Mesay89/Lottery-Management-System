'use strict';

const LotteryEvent = require('../models/LotteryEvent');
const Ticket = require('../models/Ticket');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createEvent = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    ticketPrice,
    currency,
    startDate,
    closingDate,
    drawDate,
    prizeStructure,
    totalTickets,
    participationRules,
    minimumAge,
  } = req.body;

  const eventId = `EVT-${Date.now().toString(36).toUpperCase()}`;

  const event = await LotteryEvent.create({
    eventId,
    name,
    description,
    ticketPrice,
    currency: currency || 'ETB',
    startDate,
    closingDate,
    drawDate,
    prizeStructure: prizeStructure || [],
    totalTickets,
    soldTickets: 0,
    remainingTickets: totalTickets,
    participationRules,
    minimumAge: minimumAge || 18,
    status: 'Draft',
    createdBy: req.user._id,
  });

  return ApiResponse.created(res, event, 'Lottery event created successfully.');
});

const getAllEvents = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { name: new RegExp(req.query.search, 'i') },
      { eventId: new RegExp(req.query.search, 'i') },
    ];
  }

  // Non-admin / unauthenticated users only see public statuses unless filtered specifically
  const isAdmin = req.user && ['superAdmin', 'lotteryAdmin', 'cashManager', 'ticketAgent'].includes(req.user.role);
  if (!isAdmin && !req.query.status) {
    filter.status = { $in: ['Scheduled', 'Open', 'Closed', 'Drawn', 'Published'] };
  }

  const sort = req.query.sort || '-createdAt';
  const [events, total] = await Promise.all([
    LotteryEvent.find(filter).sort(sort).skip(skip).limit(limit).populate('createdBy', 'firstName lastName email'),
    LotteryEvent.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  return ApiResponse.paginated(res, events, {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  });
});

const getPublicEvents = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = { status: { $in: ['Scheduled', 'Open', 'Published'] } };
  if (req.query.status) filter.status = req.query.status;

  const [events, total] = await Promise.all([
    LotteryEvent.find(filter).sort('-drawDate').skip(skip).limit(limit),
    LotteryEvent.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  return ApiResponse.paginated(res, events, {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  });
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await LotteryEvent.findById(req.params.id).populate('createdBy approvedBy', 'firstName lastName email');
  if (!event) return ApiResponse.error(res, 'Lottery event not found.', 404);
  return ApiResponse.success(res, event);
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await LotteryEvent.findById(req.params.id);
  if (!event) return ApiResponse.error(res, 'Lottery event not found.', 404);

  if (['Drawn', 'Published', 'Cancelled'].includes(event.status)) {
    return ApiResponse.error(res, `Cannot update event in ${event.status} status.`, 400);
  }

  const allowed = [
    'name', 'description', 'ticketPrice', 'startDate', 'closingDate',
    'drawDate', 'prizeStructure', 'totalTickets', 'participationRules', 'minimumAge',
  ];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) event[field] = req.body[field];
  });

  if (req.body.totalTickets !== undefined) {
    event.remainingTickets = Math.max(0, req.body.totalTickets - event.soldTickets);
  }
  event.updatedBy = req.user._id;
  await event.save();

  return ApiResponse.success(res, event, 'Lottery event updated successfully.');
});

const updateEventStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const event = await LotteryEvent.findById(req.params.id);
  if (!event) return ApiResponse.error(res, 'Lottery event not found.', 404);

  event.status = status;
  if (['Scheduled', 'Open'].includes(status) && !event.approvedBy) {
    event.approvedBy = req.user._id;
  }
  event.updatedBy = req.user._id;
  await event.save();

  return ApiResponse.success(res, event, `Event status updated to ${status}.`);
});

const approveEvent = asyncHandler(async (req, res) => {
  const event = await LotteryEvent.findById(req.params.id);
  if (!event) return ApiResponse.error(res, 'Lottery event not found.', 404);
  event.status = 'Scheduled';
  event.approvedBy = req.user._id;
  await event.save();
  return ApiResponse.success(res, event, 'Event approved and scheduled.');
});

const openEvent = asyncHandler(async (req, res) => {
  const event = await LotteryEvent.findByIdAndUpdate(
    req.params.id,
    { status: 'Open', updatedBy: req.user._id },
    { new: true }
  );
  if (!event) return ApiResponse.error(res, 'Lottery event not found.', 404);
  return ApiResponse.success(res, event, 'Event is now Open for ticket sales.');
});

const closeEvent = asyncHandler(async (req, res) => {
  const event = await LotteryEvent.findByIdAndUpdate(
    req.params.id,
    { status: 'Closed', updatedBy: req.user._id },
    { new: true }
  );
  if (!event) return ApiResponse.error(res, 'Lottery event not found.', 404);
  return ApiResponse.success(res, event, 'Event is now Closed.');
});

const cancelEvent = asyncHandler(async (req, res) => {
  const event = await LotteryEvent.findByIdAndUpdate(
    req.params.id,
    { status: 'Cancelled', updatedBy: req.user._id },
    { new: true }
  );
  if (!event) return ApiResponse.error(res, 'Lottery event not found.', 404);
  return ApiResponse.success(res, event, 'Event cancelled.');
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await LotteryEvent.findById(req.params.id);
  if (!event) return ApiResponse.error(res, 'Lottery event not found.', 404);
  if (event.status !== 'Draft') {
    return ApiResponse.error(res, 'Only Draft events can be deleted.', 400);
  }
  await event.deleteOne();
  return ApiResponse.success(res, null, 'Draft event deleted.');
});

const getEventStats = asyncHandler(async (req, res) => {
  const event = await LotteryEvent.findById(req.params.id);
  if (!event) return ApiResponse.error(res, 'Lottery event not found.', 404);

  const ticketStats = await Ticket.aggregate([
    { $match: { lotteryEvent: event._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  return ApiResponse.success(res, {
    event,
    ticketStats,
    revenue: event.soldTickets * event.ticketPrice,
  });
});

module.exports = {
  createEvent,
  getAllEvents,
  getPublicEvents,
  getEventById,
  updateEvent,
  updateEventStatus,
  approveEvent,
  openEvent,
  closeEvent,
  cancelEvent,
  deleteEvent,
  getEventStats,
};
