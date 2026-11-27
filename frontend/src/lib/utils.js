import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

/** Merge Tailwind classes safely */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/** Format currency in ETB */
export function formatCurrency(amount, options = {}) {
  const { showSymbol = true, decimals = 2 } = options
  if (amount === null || amount === undefined || isNaN(amount)) return 'ETB 0.00'
  const formatted = Number(amount).toLocaleString('en-ET', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return showSymbol ? `ETB ${formatted}` : formatted
}

/** Format a date string to human-readable */
export function formatDate(dateStr, fmt = 'MMM dd, yyyy') {
  if (!dateStr) return '—'
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    if (!isValid(date)) return '—'
    return format(date, fmt)
  } catch {
    return '—'
  }
}

/** Format date with time */
export function formatDateTime(dateStr) {
  return formatDate(dateStr, 'MMM dd, yyyy HH:mm')
}

/** Relative time (e.g. "3 hours ago") */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '—'
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    if (!isValid(date)) return '—'
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return '—'
  }
}

/** Truncate text */
export function truncate(str, length = 50) {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + '…' : str
}

/** Get initials from full name */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

/** Generate a random ticket number */
export function generateTicketNumber() {
  const prefix = 'OLM'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

/** Validate Ethiopian phone number */
export function isValidEthiopianPhone(phone) {
  const cleaned = phone.replace(/\s/g, '')
  return /^(\+2519\d{8}|09\d{8})$/.test(cleaned)
}

/** Normalize Ethiopian phone to +251 format */
export function normalizePhone(phone) {
  const cleaned = phone.replace(/\s/g, '')
  if (cleaned.startsWith('09')) {
    return '+251' + cleaned.slice(1)
  }
  return cleaned
}

/** Sleep utility */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Safe JSON parse */
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

/** Download a blob as a file */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Convert object to query string */
export function toQueryString(obj = {}) {
  const params = new URLSearchParams()
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value)
    }
  })
  return params.toString()
}

/** Capitalize first letter */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/** Format role for display */
export function formatRole(role = '') {
  const roleMap = {
    superAdmin: 'Super Admin',
    lotteryAdmin: 'Lottery Admin',
    cashManager: 'Cash Manager',
    ticketAgent: 'Ticket Agent',
    customer: 'Customer',
  }
  return roleMap[role] || capitalize(role)
}

/** Get role color classes */
export function getRoleColor(role) {
  const colorMap = {
    superAdmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    lotteryAdmin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    cashManager: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    ticketAgent: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    customer: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  }
  return colorMap[role] || 'bg-slate-100 text-slate-700'
}

/** Get status color classes */
export function getStatusColor(status) {
  const colorMap = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    deactivated: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    closed: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    drawn: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    published: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    successful: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    winning: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-300',
    claimed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    unclaimed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    sold: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    available: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  }
  return colorMap[status?.toLowerCase()] || 'bg-slate-100 text-slate-700'
}

/** Pluralize a word */
export function pluralize(count, singular, plural) {
  return count === 1 ? singular : (plural || singular + 's')
}

/** Format large numbers with K/M suffixes */
export function formatNumber(num) {
  if (!num && num !== 0) return '0'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toLocaleString()
}
