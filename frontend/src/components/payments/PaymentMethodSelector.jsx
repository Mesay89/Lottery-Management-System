import { Smartphone, Building2, Banknote } from 'lucide-react'
import { cn } from '../../lib/utils'

const providers = [
  {
    id: 'telebirr',
    name: 'Telebirr',
    subtitle: 'Instant mobile money payment via Ethio Telecom',
    icon: Smartphone,
    accent: 'border-[#00a651] bg-emerald-50/60 dark:bg-emerald-900/20 text-[#00a651]',
  },
  {
    id: 'cbe',
    name: 'CBE Birr',
    subtitle: 'Commercial Bank of Ethiopia mobile banking',
    icon: Building2,
    accent: 'border-blue-600 bg-blue-50/60 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  },
]

export function PaymentMethodSelector({ selected, onSelect, includeCash = false }) {
  const list = includeCash
    ? [
        ...providers,
        {
          id: 'cash',
          name: 'Cash Payment',
          subtitle: 'Pay cash directly to authorized ticket agent',
          icon: Banknote,
          accent: 'border-amber-600 bg-amber-50/60 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
        },
      ]
    : providers

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {list.map((p) => {
        const Icon = p.icon
        const isSelected = selected === p.id
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer',
              isSelected
                ? p.accent
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
            )}
          >
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 shadow-sm shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">{p.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.subtitle}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default PaymentMethodSelector
