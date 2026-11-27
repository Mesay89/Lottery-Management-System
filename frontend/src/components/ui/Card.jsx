import { cn } from '../../lib/utils'

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('px-6 py-4 border-b border-slate-200 dark:border-slate-700', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-lg font-semibold text-slate-900 dark:text-white', className)}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className }) {
  return <div className={cn('p-6', className)}>{children}</div>
}

export default Card
