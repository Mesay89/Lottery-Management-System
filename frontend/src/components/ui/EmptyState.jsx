import { Inbox } from 'lucide-react'
import { cn } from '../../lib/utils'

export function EmptyState({ icon: Icon = Inbox, title = 'No data found', description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{title}</h4>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}

export default EmptyState
