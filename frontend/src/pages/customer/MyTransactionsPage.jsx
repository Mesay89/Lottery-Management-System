import { useState } from 'react'
import { useMyTransactions } from '../../hooks/useTransactions'
import Table from '../../components/ui/Table'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import { formatCurrency, formatDateTime } from '../../lib/utils'

export default function MyTransactionsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useMyTransactions({ page, limit: 10 })

  const columns = [
    { key: 'transactionRef', header: 'Reference', render: (r) => <span className="font-mono text-xs font-semibold">{r.transactionRef}</span> },
    { key: 'type', header: 'Type', render: (r) => <span className="capitalize">{r.type?.replace('_', ' ')}</span> },
    { key: 'paymentMethod', header: 'Method', render: (r) => <span className="uppercase font-medium text-xs">{r.paymentMethod}</span> },
    { key: 'amount', header: 'Amount', render: (r) => <span className="font-semibold">{formatCurrency(r.amount)}</span> },
    { key: 'createdAt', header: 'Date', render: (r) => formatDateTime(r.createdAt) },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Transactions</h1>
      <Table
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        emptyTitle="No transactions yet"
      />
    </div>
  )
}
