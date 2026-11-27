// Application-wide constants

export const APP_NAME = 'OLMS'
export const APP_FULL_NAME = 'Online Lottery Management System'
export const APP_VERSION = '1.0.0'
export const CURRENCY = 'ETB'

// User Roles
export const ROLES = {
  SUPER_ADMIN: 'superAdmin',
  LOTTERY_ADMIN: 'lotteryAdmin',
  CASH_MANAGER: 'cashManager',
  TICKET_AGENT: 'ticketAgent',
  CUSTOMER: 'customer',
}

// Lottery Event Statuses
export const EVENT_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  OPEN: 'open',
  CLOSED: 'closed',
  DRAWN: 'drawn',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
}

// Ticket Statuses
export const TICKET_STATUS = {
  AVAILABLE: 'available',
  SOLD: 'sold',
  WINNING: 'winning',
  CLAIMED: 'claimed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
}

// Draw Statuses
export const DRAW_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

// Prize Claim Statuses
export const CLAIM_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAID: 'paid',
  EXPIRED: 'expired',
}

// Transaction Statuses
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  REVERSED: 'reversed',
}

// Payment Methods
export const PAYMENT_METHODS = {
  TELEBIRR: 'telebirr',
  CBE: 'cbe',
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
}

// User Statuses
export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DEACTIVATED: 'deactivated',
  PENDING: 'pending',
}

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// Date formats
export const DATE_FORMAT = 'MMM dd, yyyy'
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm'
export const TIME_FORMAT = 'HH:mm'

// Local storage keys
export const STORAGE_KEYS = {
  AUTH: 'olms-auth',
  UI: 'olms-ui',
  THEME: 'olms-theme',
}

// Query keys
export const QUERY_KEYS = {
  EVENTS: 'events',
  TICKETS: 'tickets',
  DRAWS: 'draws',
  RESULTS: 'results',
  WINNERS: 'winners',
  CLAIMS: 'claims',
  TRANSACTIONS: 'transactions',
  USERS: 'users',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  AUDIT_LOGS: 'audit-logs',
  PRIZES: 'prizes',
  PROFILE: 'profile',
  DASHBOARD_STATS: 'dashboard-stats',
}

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
  },
  EVENTS: '/lottery-events',
  TICKETS: '/tickets',
  DRAWS: '/draws',
  RESULTS: '/results',
  WINNERS: '/winners',
  PRIZES: '/prizes',
  CLAIMS: '/prize-claims',
  TRANSACTIONS: '/transactions',
  NOTIFICATIONS: '/notifications',
  REPORTS: '/reports',
  USERS: '/users',
  AUDIT_LOGS: '/audit-logs',
  ROLES: '/roles',
}

// Chart colors
export const CHART_COLORS = {
  primary: '#1a7a4a',
  secondary: '#f5a623',
  accent: '#c0392b',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  cyan: '#06b6d4',
  teal: '#14b8a6',
}

export const CHART_COLOR_ARRAY = [
  '#1a7a4a', '#f5a623', '#c0392b', '#3b82f6', '#8b5cf6',
  '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#a855f7',
]

// Owner receiving payment accounts for direct transfers
export const OWNER_PAYMENT_ACCOUNTS = {
  telebirr: {
    label: 'Telebirr',
    accountName: 'Mesay Boja',
    displayNumber: '0939648955',
    rawNumber: '0939648955',
  },
  cbe: {
    label: 'CBE',
    accountName: 'Mesay Boja Sefisa',
    displayNumber: '1000475739098',
    rawNumber: '1000475739098',
  },
}

// Ethiopian banks / payment providers
export const PAYMENT_PROVIDERS = [
  {
    id: PAYMENT_METHODS.TELEBIRR,
    name: 'Telebirr',
    description: 'Pay with Telebirr mobile money',
    color: '#00a651',
    icon: 'phone',
  },
  {
    id: PAYMENT_METHODS.CBE,
    name: 'CBE Birr',
    description: 'Pay with Commercial Bank of Ethiopia',
    color: '#1e3a8a',
    icon: 'building-2',
  },
  {
    id: PAYMENT_METHODS.CASH,
    name: 'Cash',
    description: 'Pay with cash at the counter',
    color: '#059669',
    icon: 'banknotes',
  },
]

// Min age for lottery participation
export const MIN_LOTTERY_AGE = 18

// Max prize claim days
export const PRIZE_CLAIM_DAYS = 90
