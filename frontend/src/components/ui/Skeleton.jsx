import { cn } from '../../lib/utils'

export function Skeleton({ className }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700', className)}
    />
  )
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Skeleton
