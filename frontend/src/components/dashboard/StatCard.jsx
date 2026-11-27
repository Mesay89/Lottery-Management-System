import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../lib/utils'

const colorClasses = {
  green: 'bg-emerald-50 text-[#1a7a4a] dark:bg-emerald-900/30 dark:text-emerald-400',
  gold: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  red: 'bg-red-50 text-[#c0392b] dark:bg-red-900/30 dark:text-red-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
}

export function StatCard({ title, value, icon: Icon, trend, color = 'green', subtitle }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-xl', colorClasses[color] || colorClasses.green)}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          {trend >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className={trend >= 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
            {trend >= 0 ? `+${trend}%` : `${trend}%`}
          </span>
          <span className="text-slate-400">from last month</span>
        </div>
      )}
    </div>
  )
}

export default StatCard
