'use strict';

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(protect);

router.get('/dashboard', authorize('superAdmin', 'lotteryAdmin', 'cashManager'), reportController.getDashboardStats);
router.get('/lottery-dashboard', authorize('superAdmin', 'lotteryAdmin'), reportController.getLotteryAdminDashboard);
router.get('/finance-dashboard', authorize('superAdmin', 'cashManager'), reportController.getFinanceDashboard);
router.get('/tickets', authorize('superAdmin', 'lotteryAdmin', 'cashManager'), reportController.getTicketSalesReport);
router.get('/events', authorize('superAdmin', 'lotteryAdmin'), reportController.getEventReport);
router.get('/financial', authorize('superAdmin', 'cashManager'), reportController.getFinancialReport);
router.get('/claims', authorize('superAdmin', 'cashManager', 'lotteryAdmin'), reportController.getPrizeClaimReport);
router.get('/export/csv', authorize('superAdmin', 'lotteryAdmin', 'cashManager'), reportController.exportCSV);
router.get('/export/pdf', authorize('superAdmin', 'lotteryAdmin', 'cashManager'), reportController.exportPDF);

module.exports = router;
