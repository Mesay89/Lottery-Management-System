import { TableSkeleton } from './Skeleton'
import EmptyState from './EmptyState'
import Pagination from './Pagination'
import { cn } from '../../lib/utils'

export function Table({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription,
  onRowClick,
  pagination,
  onPageChange,
  className,
}) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <TableSkeleton rows={5} cols={columns.length || 5} />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    )
  }

  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {columns.map((col, idx) => (
                <th key={col.key || idx} className={cn('px-4 py-3 font-semibold whitespace-nowrap', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {data.map((row, rowIdx) => (
              <tr
                key={row._id || row.id || rowIdx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col, colIdx) => (
                  <td key={col.key || colIdx} className={cn('px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap', col.cellClassName)}>
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && onPageChange && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}

export default Table
