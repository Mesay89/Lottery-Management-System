'use strict';

const Ticket = require('../models/Ticket');
const LotteryEvent = require('../models/LotteryEvent');
const Transaction = require('../models/Transaction');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ticketService = require('../services/ticket.service');
const emailService = require('../services/email.service');

const registerTicket = asyncHandler(async (req, res) => {
  const {
    lotteryEvent: eventId,
    ownerName,
    ownerPhone,
    ownerEmail,
    purchaseChannel,
    transactionRef,
  } = req.body;

  const event = await LotteryEvent.findById(eventId);
  if (!event) return ApiResponse.error(res, 'Lottery event not found.', 404);

  if (event.status !== 'Open') {
    return ApiResponse.error(res, `Ticket registration is closed. Event status is ${event.status}.`, 400);
  }

  if (new Date() > new Date(event.closingDate)) {
    return ApiResponse.error(res, 'Sales closing time has passed for this event.', 400);
  }

  if (event.remainingTickets <= 0) {
    return ApiResponse.error(res, 'No tickets remaining for this event.', 400);
  }

  const ticketNumber = await ticketService.generateTicketNumber();

  const linkedTransaction = transactionRef
    ? await Transaction.findOne({ transactionRef })
    : null;
  const initialStatus = linkedTransaction && linkedTransaction.status === 'Pending'
    ? 'Pending'
    : 'Valid';

  const isAgent = req.user.role === 'ticketAgent';
  const ticket = await Ticket.create({
    ticketNumber,
    lotteryEvent: event._id,
    owner: isAgent ? undefined : req.user._id,
    ownerName: ownerName || `${req.user.firstName} ${req.user.lastName}`,
    ownerPhone: ownerPhone || req.user.phone,
    ownerEmail: ownerEmail || req.user.email,
    status: initialStatus,
    purchaseDate: new Date(),
    purchaseChannel: purchaseChannel || (isAgent ? 'agent' : 'online'),
    soldBy: isAgent ? req.user._id : undefined,
    transactionRef,
  });

  if (linkedTransaction && !linkedTransaction.ticket) {
    linkedTransaction.ticket = ticket._id;
    await linkedTransaction.save();
  }

  event.soldTickets += 1;
  event.remainingTickets = Math.max(0, event.totalTickets - event.soldTickets);
  await event.save();

  if (emailService.sendTicketConfirmationEmail && ticket.ownerEmail) {
    emailService.sendTicketConfirmationEmail({ email: ticket.ownerEmail, firstName: ticket.ownerName }, ticket, event).catch(() => {});
  }

  const message = initialStatus === 'Pending'
    ? 'Ticket registered in Pending status. Awaiting Cash Manager payment approval.'
    : 'Ticket registered successfully.';

  return ApiResponse.created(res, ticket, message);
});

const getAllTickets = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.lotteryEvent) filter.lotteryEvent = req.query.lotteryEvent;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { ticketNumber: new RegExp(req.query.search, 'i') },
      { ownerName: new RegExp(req.query.search, 'i') },
      { ownerPhone: new RegExp(req.query.search, 'i') },
    ];
  }

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('lotteryEvent', 'name eventId drawDate ticketPrice status')
      .populate('owner', 'firstName lastName email'),
    Ticket.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  return ApiResponse.paginated(res, tickets, {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  });
});

const getMyTickets = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const ownerMatch = [{ owner: req.user._id }];
  if (req.user.email) {
    ownerMatch.push({ ownerEmail: req.user.email.toLowerCase() });
  }
  const filter = { $or: ownerMatch };
  if (req.query.status) filter.status = req.query.status;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('lotteryEvent', 'name eventId drawDate ticketPrice status'),
    Ticket.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  return ApiResponse.paginated(res, tickets, {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  });
});

const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('lotteryEvent')
    .populate('owner', 'firstName lastName email phone')
    .populate('soldBy', 'firstName lastName');
  if (!ticket) return ApiResponse.error(res, 'Ticket not found.', 404);
  return ApiResponse.success(res, ticket);
});

const getTicketByNumber = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ ticketNumber: req.params.ticketNumber })
    .populate('lotteryEvent', 'name eventId drawDate status');
  if (!ticket) return ApiResponse.error(res, 'Ticket not found.', 404);
  return ApiResponse.success(res, ticket);
});

const verifyTicket = asyncHandler(async (req, res) => {
  const { ticketNumber } = req.body;
  const ticket = await Ticket.findOne({ ticketNumber })
    .populate('lotteryEvent', 'name eventId drawDate status prizeStructure');

  if (!ticket) {
    return ApiResponse.error(res, 'Ticket not found.', 404);
  }

  return ApiResponse.success(res, {
    valid: ticket.status === 'Valid' || ticket.status === 'Verified',
    ticket,
  }, 'Ticket verification completed.');
});

const cancelTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return ApiResponse.error(res, 'Ticket not found.', 404);

  if (ticket.status === 'Cancelled') {
    return ApiResponse.error(res, 'Ticket is already cancelled.', 400);
  }

  ticket.status = 'Cancelled';
  await ticket.save();

  await LotteryEvent.findByIdAndUpdate(ticket.lotteryEvent, {
    $inc: { soldTickets: -1, remainingTickets: 1 },
  });

  return ApiResponse.success(res, ticket, 'Ticket cancelled successfully.');
});

const generateReceipt = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate('lotteryEvent');
  if (!ticket) return ApiResponse.error(res, 'Ticket not found.', 404);

  const pdfBuffer = await ticketService.generateReceiptPDF(ticket, ticket.lotteryEvent, req.user);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=receipt-${ticket.ticketNumber}.pdf`,
    'Content-Length': pdfBuffer.length,
  });
  return res.send(pdfBuffer);
});

const bulkRegisterTickets = asyncHandler(async (req, res) => {
  const { lotteryEvent: eventId, quantity = 1, ownerName, ownerPhone, ownerEmail } = req.body;
  const count = Math.min(20, Math.max(1, parseInt(quantity, 10)));

  const event = await LotteryEvent.findById(eventId);
  if (!event) return ApiResponse.error(res, 'Lottery event not found.', 404);
  if (event.status !== 'Open') return ApiResponse.error(res, 'Event is not open.', 400);
  if (event.remainingTickets < count) return ApiResponse.error(res, 'Insufficient tickets remaining.', 400);

  const createdTickets = [];
  for (let i = 0; i < count; i++) {
    const ticketNumber = await ticketService.generateTicketNumber();
    const ticket = await Ticket.create({
      ticketNumber,
      lotteryEvent: event._id,
      ownerName: ownerName || 'Walk-in Customer',
      ownerPhone,
      ownerEmail,
      status: 'Valid',
      purchaseDate: new Date(),
      purchaseChannel: 'agent',
      soldBy: req.user._id,
    });
    createdTickets.push(ticket);
  }

  event.soldTickets += count;
  event.remainingTickets = Math.max(0, event.totalTickets - event.soldTickets);
  await event.save();

  return ApiResponse.created(res, createdTickets, `${count} tickets registered successfully.`);
});

module.exports = {
  registerTicket,
  getAllTickets,
  getMyTickets,
  getTicketById,
  getTicketByNumber,
  verifyTicket,
  cancelTicket,
  generateReceipt,
  bulkRegisterTickets,
};
