'use strict';

const express = require('express');
const router = express.Router();
const winnerController = require('../controllers/winner.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { auditAction } = require('../middleware/audit.middleware');

router.use(protect);

router.get('/my', winnerController.getMyWinnings);
router.get('/', authorize('superAdmin', 'lotteryAdmin', 'cashManager'), winnerController.getAllWinners);
router.get('/:id', winnerController.getWinnerById);
router.post('/identify', authorize('superAdmin', 'lotteryAdmin'), auditAction('IDENTIFY_WINNERS', 'Winner'), winnerController.identifyWinners);
router.patch('/:id/verify', authorize('superAdmin', 'lotteryAdmin'), auditAction('VERIFY', 'Winner'), winnerController.verifyWinner);

module.exports = router;
