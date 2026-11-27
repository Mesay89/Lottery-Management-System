'use strict';

const User = require('../models/User');
const LotteryEvent = require('../models/LotteryEvent');
const Ticket = require('../models/Ticket');
const Transaction = require('../models/Transaction');
const PrizeClaim = require('../models/PrizeClaim');
const Winner = require('../models/Winner');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const reportService = require('../services/report.service');

const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalEvents,
    totalTickets,
    revenueAgg,
    paidClaimsAgg,
    pendingClaims,
    usersByRole,
    eventsByStatus,
  ] = await Promise.all([
    User.countDocuments(),
    LotteryEvent.countDocuments(),
    Ticket.countDocuments({ status: { $ne: 'Cancelled' } }),
    Transaction.aggregate([
      { $match: { type: 'ticket_purchase', status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { type: 'prize_payment', status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    PrizeClaim.countDocuments({ status: { $in: ['Submitted', 'Under Review'] } }),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    LotteryEvent.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  return ApiResponse.success(res, {
    totalUsers,
    totalEvents,
    totalTickets,
    totalRevenue: revenueAgg[0]?.total || 0,
    totalPrizesPaid: paidClaimsAgg[0]?.total || 0,
    pendingClaims,
    usersByRole,
    eventsByStatus,
  });
});

const getLotteryAdminDashboard = asyncHandler(async (req, res) => {
  const [openEvents, totalEvents, totalTickets, totalWinners, eventsByStatus] = await Promise.all([
    LotteryEvent.countDocuments({ status: 'Open' }),
    LotteryEvent.countDocuments(),
    Ticket.countDocuments({ status: { $ne: 'Cancelled' } }),
    Winner.countDocuments(),
    LotteryEvent.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  return ApiResponse.success(res, {
    openEvents,
    totalEvents,
    totalTickets,
    totalWinners,
    eventsByStatus,
  });
});

const getFinanceDashboard = asyncHandler(async (req, res) => {
  const [revenueByMethod, totalRevenueAgg, totalPaidAgg, pendingClaims, recentTransactions] = await Promise.all([
    Transaction.aggregate([
      { $match: { type: 'ticket_purchase', status: 'Completed' } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { type: 'ticket_purchase', status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { type: 'prize_payment', status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    PrizeClaim.countDocuments({ status: { $in: ['Submitted', 'Under Review'] } }),
    Transaction.find().sort('-createdAt').limit(10).populate('customer', 'firstName lastName'),
  ]);

  return ApiResponse.success(res, {
    revenueByMethod,
    totalRevenue: totalRevenueAgg[0]?.total || 0,
    totalPrizesPaid: totalPaidAgg[0]?.total || 0,
    pendingClaims,
    recentTransactions,
  });
});

const buildDateFilter = (startDate, endDate) => {
  if (!startDate && !endDate) return {};
  const filter = {};
  if (startDate) filter.$gte = new Date(startDate);
  if (endDate) filter.$lte = new Date(endDate);
  return { createdAt: filter };
};

const getTicketSalesReport = asyncHandler(async (req, res) => {
  const filter = buildDateFilter(req.query.startDate, req.query.endDate);
  if (req.query.lotteryEvent) filter.lotteryEvent = req.query.lotteryEvent;

  const tickets = await Ticket.find(filter)
    .sort('-createdAt')
    .limit(500)
    .populate('lotteryEvent', 'name eventId ticketPrice');
  return ApiResponse.success(res, tickets);
});

const getEventReport = asyncHandler(async (req, res) => {
  const filter = buildDateFilter(req.query.startDate, req.query.endDate);
  const events = await LotteryEvent.find(filter).sort('-createdAt');
  return ApiResponse.success(res, events);
});

const getFinancialReport = asyncHandler(async (req, res) => {
  const filter = buildDateFilter(req.query.startDate, req.query.endDate);
  if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
  const transactions = await Transaction.find(filter)
    .sort('-createdAt')
    .limit(500)
    .populate('customer', 'firstName lastName email');
  return ApiResponse.success(res, transactions);
});

const getPrizeClaimReport = asyncHandler(async (req, res) => {
  const filter = buildDateFilter(req.query.startDate, req.query.endDate);
  if (req.query.status) filter.status = req.query.status;
  const claims = await PrizeClaim.find(filter)
    .sort('-createdAt')
    .limit(500)
    .populate('customer', 'firstName lastName')
    .populate('lotteryEvent', 'name')
    .populate('winner', 'prizeAmount prizeRank');
  return ApiResponse.success(res, claims);
});

const getExportData = async (type, query) => {
  const filter = buildDateFilter(query.startDate, query.endDate);
  if (type === 'transactions' || type === 'financial') {
    const docs = await Transaction.find(filter).sort('-createdAt').limit(500).lean();
    return {
      title: 'Financial Transactions Report',
      columns: ['transactionRef', 'type', 'amount', 'currency', 'paymentMethod', 'status', 'createdAt'],
      rows: docs.map((d) => ({
        ...d,
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '',
      })),
    };
  }
  if (type === 'tickets') {
    const docs = await Ticket.find(filter).sort('-createdAt').limit(500).lean();
    return {
      title: 'Ticket Registration Report',
      columns: ['ticketNumber', 'ownerName', 'ownerPhone', 'status', 'purchaseChannel', 'purchaseDate'],
      rows: docs.map((d) => ({
        ...d,
        purchaseDate: d.purchaseDate ? new Date(d.purchaseDate).toISOString().split('T')[0] : '',
      })),
    };
  }
  const docs = await LotteryEvent.find(filter).sort('-createdAt').limit(500).lean();
  return {
    title: 'Lottery Events Report',
    columns: ['eventId', 'name', 'ticketPrice', 'totalTickets', 'soldTickets', 'status'],
    rows: docs,
  };
};

const exportCSV = asyncHandler(async (req, res) => {
  const { type = 'financial' } = req.query;
  const { columns, rows } = await getExportData(type, req.query);
  const csv = reportService.generateCSV(rows, columns);

  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': `attachment; filename=olms-${type}-report.csv`,
  });
  return res.send(csv);
});

const exportPDF = asyncHandler(async (req, res) => {
  const { type = 'financial' } = req.query;
  const { title, columns, rows } = await getExportData(type, req.query);
  const pdfBuffer = await reportService.generatePDF(rows, title, columns);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=olms-${type}-report.pdf`,
    'Content-Length': pdfBuffer.length,
  });
  return res.send(pdfBuffer);
});

module.exports = {
  getDashboardStats,
  getLotteryAdminDashboard,
  getFinanceDashboard,
  getTicketSalesReport,
  getEventReport,
  getFinancialReport,
  getPrizeClaimReport,
  exportCSV,
  exportPDF,
};
