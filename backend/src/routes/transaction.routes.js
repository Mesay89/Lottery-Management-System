'use strict';

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { auditAction } = require('../middleware/audit.middleware');
const { uploadPaymentProof } = require('../middleware/upload.middleware');
const { createTransactionValidator, initiateMobilePaymentValidator } = require('../validators/transaction.validator');

// Payment gateway callbacks (webhooks - no JWT)
router.post('/telebirr/callback', transactionController.handleTelebirrCallback);
router.post('/cbe/callback', transactionController.handleCBECallback);

router.use(protect);

router.post('/telebirr/initiate', uploadPaymentProof, initiateMobilePaymentValidator, validate, auditAction('INITIATE_TELEBIRR', 'Transaction'), transactionController.initiateTelebirrPayment);
router.post('/cbe/initiate', uploadPaymentProof, initiateMobilePaymentValidator, validate, auditAction('INITIATE_CBE', 'Transaction'), transactionController.initiateCBEPayment);

router.post('/', createTransactionValidator, validate, auditAction('CREATE', 'Transaction'), transactionController.createTransaction);
router.get('/my', transactionController.getMyTransactions);
router.get('/', authorize('superAdmin', 'cashManager', 'lotteryAdmin'), transactionController.getAllTransactions);
router.get('/:id', transactionController.getTransactionById);
router.post('/:id/verify', authorize('superAdmin', 'cashManager'), transactionController.verifyTransaction);

module.exports = router;
