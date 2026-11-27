import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

const variants = {
  primary: 'bg-[#1a7a4a] hover:bg-[#14603a] text-white shadow-sm focus:ring-[#1a7a4a]/40',
  secondary: 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200',
  gold: 'bg-[#f5a623] hover:bg-[#d98e16] text-slate-900 font-semibold shadow-sm',
  danger: 'bg-[#c0392b] hover:bg-[#a93226] text-white shadow-sm focus:ring-red-500/40',
  ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
  link: 'text-[#1a7a4a] dark:text-emerald-400 hover:underline p-0 h-auto',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export const Button = forwardRef(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled = false, children, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          variants[variant] || variants.primary,
          sizes[size] || sizes.md,
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
