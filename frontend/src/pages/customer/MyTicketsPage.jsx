import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { useMyTickets } from '../../hooks/useTickets'
import Table from '../../components/ui/Table'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import { formatDateTime, formatCurrency } from '../../lib/utils'

export default function MyTicketsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const { data, isLoading, isFetching, refetch } = useMyTickets({
    page,
    limit: 10,
    status: status || undefined,
  })

  const tickets = data?.data || []
  const pagination = data?.pagination

  const columns = [
    {
      key: 'ticketNumber',
      header: 'Ticket Number',
      render: (r) =>
        r.status === 'Pending' ? (
          <span className="text-xs italic text-slate-400">Hidden until approved</span>
        ) : (
          <span className="font-mono font-semibold">{r.ticketNumber}</span>
        ),
    },
    { key: 'event', header: 'Lottery Event', render: (r) => r.lotteryEvent?.name || '—' },
    { key: 'price', header: 'Price', render: (r) => formatCurrency(r.lotteryEvent?.ticketPrice || 0) },
    { key: 'purchaseDate', header: 'Purchased', render: (r) => formatDateTime(r.purchaseDate || r.createdAt) },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
    {
      key: 'winner',
      header: 'Result',
      render: (r) =>
        r.isWinner ? (
          <Badge variant="success">Winner (#{r.prizeRank})</Badge>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) =>
        r.status === 'Pending' ? (
          <span className="text-xs font-medium text-amber-600">Awaiting Cash Manager Approval</span>
        ) : r.status === 'Cancelled' ? (
          <span className="text-xs font-medium text-rose-600">Rejected / Cancelled</span>
        ) : (
          <Link to={`/customer/tickets/${r._id}`} className="text-xs font-semibold text-[#1a7a4a] hover:underline">
            View Ticket & Receipt
          </Link>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Digital Tickets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tickets remain Pending until your payment is approved by the Cash Manager.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-40">
            <Select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              placeholder="All Statuses"
              options={[
                { value: 'Pending', label: 'Pending' },
                { value: 'Valid', label: 'Valid (Approved)' },
                { value: 'Verified', label: 'Verified' },
                { value: 'Cancelled', label: 'Cancelled' },
              ]}
            />
          </div>
          <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Check Status
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={tickets}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        emptyTitle="No tickets found"
      />
    </div>
  )
}
