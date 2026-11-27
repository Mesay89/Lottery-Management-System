'use strict';

const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { auditAction } = require('../middleware/audit.middleware');
const { registerTicketValidator, verifyTicketValidator } = require('../validators/ticket.validator');

router.use(protect);

router.post('/', registerTicketValidator, validate, auditAction('REGISTER', 'Ticket'), ticketController.registerTicket);
router.post('/bulk', authorize('superAdmin', 'lotteryAdmin', 'ticketAgent'), auditAction('BULK_REGISTER', 'Ticket'), ticketController.bulkRegisterTickets);
router.post('/verify', verifyTicketValidator, validate, ticketController.verifyTicket);
router.get('/my', ticketController.getMyTickets);
router.get('/number/:ticketNumber', ticketController.getTicketByNumber);
router.get('/', authorize('superAdmin', 'lotteryAdmin', 'cashManager', 'ticketAgent'), ticketController.getAllTickets);
router.get('/:id', ticketController.getTicketById);
router.get('/:id/receipt', ticketController.generateReceipt);
router.patch('/:id/cancel', authorize('superAdmin', 'lotteryAdmin', 'ticketAgent'), auditAction('CANCEL', 'Ticket'), ticketController.cancelTicket);

module.exports = router;
