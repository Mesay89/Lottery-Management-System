import { cn } from '../../lib/utils'

const badgeVariants = {
  default: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
}

export function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
    >
      {children}
    </span>
  )
}

export function getStatusVariant(status = '') {
  const s = String(status).toLowerCase()
  if (['active', 'open', 'valid', 'verified', 'published', 'completed', 'successful', 'approved', 'paid', 'claimed'].includes(s)) {
    return 'success'
  }
  if (['pending', 'scheduled', 'submitted', 'under review', 'under_review', 'inprogress', 'in_progress', 'draft'].includes(s)) {
    return 'warning'
  }
  if (['suspended', 'deactivated', 'cancelled', 'rejected', 'failed', 'expired', 'closed'].includes(s)) {
    return 'danger'
  }
  if (['drawn'].includes(s)) {
    return 'purple'
  }
  return 'default'
}

export default Badge
