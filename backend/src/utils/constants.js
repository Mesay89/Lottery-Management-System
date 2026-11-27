'use strict';

// ─── User Roles ───────────────────────────────────────────────────────────────
const ROLES = Object.freeze({
  SUPER_ADMIN:   'superAdmin',
  LOTTERY_ADMIN: 'lotteryAdmin',
  CASH_MANAGER:  'cashManager',
  TICKET_AGENT:  'ticketAgent',
  CUSTOMER:      'customer',
});

// ─── User Statuses ────────────────────────────────────────────────────────────
const USER_STATUS = Object.freeze({
  ACTIVE:      'active',
  SUSPENDED:   'suspended',
  DEACTIVATED: 'deactivated',
});

// ─── Event Statuses ───────────────────────────────────────────────────────────
const EVENT_STATUS = Object.freeze({
  DRAFT:     'Draft',
  SCHEDULED: 'Scheduled',
  OPEN:      'Open',
  CLOSED:    'Closed',
  DRAWN:     'Drawn',
  PUBLISHED: 'Published',
  CANCELLED: 'Cancelled',
});

// ─── Ticket Statuses ──────────────────────────────────────────────────────────
const TICKET_STATUS = Object.freeze({
  PENDING:   'Pending',
  VALID:     'Valid',
  CANCELLED: 'Cancelled',
  VERIFIED:  'Verified',
});

// ─── Draw Statuses ────────────────────────────────────────────────────────────
const DRAW_STATUS = Object.freeze({
  SCHEDULED:   'Scheduled',
  IN_PROGRESS: 'InProgress',
  COMPLETED:   'Completed',
  CANCELLED:   'Cancelled',
});

// ─── Result Statuses ──────────────────────────────────────────────────────────
const RESULT_STATUS = Object.freeze({
  DRAFT:     'Draft',
  PUBLISHED: 'Published',
  ARCHIVED:  'Archived',
});

// ─── Claim Statuses ───────────────────────────────────────────────────────────
const CLAIM_STATUS = Object.freeze({
  SUBMITTED:    'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED:     'Approved',
  REJECTED:     'Rejected',
  PAID:         'Paid',
});

// ─── Transaction Types ────────────────────────────────────────────────────────
const TRANSACTION_TYPE = Object.freeze({
  TICKET_PURCHASE: 'ticket_purchase',
  PRIZE_PAYMENT:   'prize_payment',
  REFUND:          'refund',
});

// ─── Transaction Statuses ─────────────────────────────────────────────────────
const TRANSACTION_STATUS = Object.freeze({
  PENDING:   'Pending',
  COMPLETED: 'Completed',
  FAILED:    'Failed',
  REFUNDED:  'Refunded',
});

// ─── Payment Methods ──────────────────────────────────────────────────────────
const PAYMENT_METHOD = Object.freeze({
  TELEBIRR:      'telebirr',
  CBE:           'cbe',
  CASH:          'cash',
  BANK_TRANSFER: 'bank_transfer',
});

// ─── Purchase Channels ────────────────────────────────────────────────────────
const PURCHASE_CHANNEL = Object.freeze({
  ONLINE: 'online',
  AGENT:  'agent',
});

// ─── Verification Statuses ────────────────────────────────────────────────────
const VERIFICATION_STATUS = Object.freeze({
  PENDING:  'Pending',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
});

// ─── Claim Statuses (winner) ─────────────────────────────────────────────────
const CLAIM_STATUS_WINNER = Object.freeze({
  UNCLAIMED: 'Unclaimed',
  CLAIMED:   'Claimed',
  EXPIRED:   'Expired',
});

// ─── Notification Types ───────────────────────────────────────────────────────
const NOTIFICATION_TYPE = Object.freeze({
  EMAIL:  'email',
  SMS:    'sms',
  PUSH:   'push',
  IN_APP: 'in_app',
});

// ─── Error Messages ───────────────────────────────────────────────────────────
const ERROR_MESSAGES = Object.freeze({
  UNAUTHORIZED:         'You are not authorized to perform this action.',
  UNAUTHENTICATED:      'Authentication required. Please log in.',
  NOT_FOUND:            'The requested resource was not found.',
  VALIDATION_ERROR:     'Validation failed. Please check your input.',
  INTERNAL_ERROR:       'An internal server error occurred.',
  ACCOUNT_SUSPENDED:    'Your account has been suspended.',
  ACCOUNT_DEACTIVATED:  'Your account has been deactivated.',
  INVALID_CREDENTIALS:  'Invalid email or password.',
  TOKEN_EXPIRED:        'Your session has expired. Please log in again.',
  TOKEN_INVALID:        'Invalid token.',
  EVENT_CLOSED:         'This lottery event is no longer accepting registrations.',
  TICKETS_UNAVAILABLE:  'No tickets are available for this event.',
  TICKET_ALREADY_EXISTS:'A ticket with this number already exists.',
  DRAW_NOT_COMPLETED:   'The draw has not been completed yet.',
});

// ─── HTTP Status Codes ────────────────────────────────────────────────────────
const HTTP = Object.freeze({
  OK:         200,
  CREATED:    201,
  NO_CONTENT: 204,
  BAD_REQUEST:  400,
  UNAUTHORIZED: 401,
  FORBIDDEN:    403,
  NOT_FOUND:    404,
  CONFLICT:     409,
  UNPROCESSABLE: 422,
  TOO_MANY:     429,
  SERVER_ERROR: 500,
});

// ─── Pagination Defaults ──────────────────────────────────────────────────────
const PAGINATION = Object.freeze({
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT:     100,
});

module.exports = {
  ROLES,
  USER_STATUS,
  EVENT_STATUS,
  TICKET_STATUS,
  DRAW_STATUS,
  RESULT_STATUS,
  CLAIM_STATUS,
  CLAIM_STATUS_WINNER,
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  PAYMENT_METHOD,
  PURCHASE_CHANNEL,
  VERIFICATION_STATUS,
  NOTIFICATION_TYPE,
  ERROR_MESSAGES,
  HTTP,
  PAGINATION,
};
