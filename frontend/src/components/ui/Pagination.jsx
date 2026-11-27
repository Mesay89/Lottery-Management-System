import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

export function Pagination({ page = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Page <span className="font-medium text-slate-900 dark:text-white">{page}</span> of{' '}
        <span className="font-medium text-slate-900 dark:text-white">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default Pagination
