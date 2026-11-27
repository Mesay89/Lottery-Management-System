import { cn } from '../../lib/utils'

export function Tabs({ tabs = [], activeTab, onChange, className }) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
              isActive
                ? 'border-[#1a7a4a] text-[#1a7a4a] dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
