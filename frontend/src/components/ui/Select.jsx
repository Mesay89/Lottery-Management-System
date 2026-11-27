import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Select = forwardRef(
  ({ label, error, options = [], placeholder, className, children, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a7a4a]/40 focus:border-[#1a7a4a]',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              : 'border-slate-300 dark:border-slate-600',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
export default Select
