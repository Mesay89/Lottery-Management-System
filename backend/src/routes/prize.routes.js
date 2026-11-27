'use strict';

const express = require('express');
const router = express.Router();
const prizeController = require('../controllers/prize.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { auditAction } = require('../middleware/audit.middleware');
const { createPrizeValidator, updatePrizeValidator } = require('../validators/prize.validator');

router.get('/event/:eventId', prizeController.getPrizesByEvent);

router.use(protect);
router.post('/', authorize('superAdmin', 'lotteryAdmin'), createPrizeValidator, validate, auditAction('CREATE', 'Prize'), prizeController.createPrize);
router.put('/:id', authorize('superAdmin', 'lotteryAdmin'), updatePrizeValidator, validate, auditAction('UPDATE', 'Prize'), prizeController.updatePrize);
router.delete('/:id', authorize('superAdmin', 'lotteryAdmin'), auditAction('DELETE', 'Prize'), prizeController.deletePrize);

module.exports = router;
