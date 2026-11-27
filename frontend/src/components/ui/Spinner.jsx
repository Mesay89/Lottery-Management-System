import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  }
  return <Loader2 className={cn('animate-spin text-[#1a7a4a]', sizes[size] || sizes.md, className)} />
}

export function PageLoader() {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
    </div>
  )
}

export default Spinner
