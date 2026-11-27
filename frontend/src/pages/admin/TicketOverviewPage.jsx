import { useState } from 'react'
import { useTickets } from '../../hooks/useTickets'
import Table from '../../components/ui/Table'
import SearchBar from '../../components/ui/SearchBar'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import { formatDateTime } from '../../lib/utils'

export default function TicketOverviewPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading } = useTickets({ page, limit: 15, search })

  const columns = [
    { key: 'ticketNumber', header: 'Ticket #', render: (t) => <span className="font-mono font-semibold">{t.ticketNumber}</span> },
    { key: 'event', header: 'Event', render: (t) => t.lotteryEvent?.name || '—' },
    { key: 'ownerName', header: 'Owner' },
    { key: 'ownerPhone', header: 'Phone' },
    { key: 'purchaseChannel', header: 'Channel', render: (t) => <span className="capitalize">{t.purchaseChannel}</span> },
    { key: 'purchaseDate', header: 'Date', render: (t) => formatDateTime(t.purchaseDate || t.createdAt) },
    { key: 'status', header: 'Status', render: (t) => <Badge variant={getStatusVariant(t.status)}>{t.status}</Badge> },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tickets Overview</h1>
      <SearchBar value={search} onChange={setSearch} placeholder="Search ticket number, owner, phone..." />
      <Table columns={columns} data={data?.data || []} isLoading={isLoading} pagination={data?.pagination} onPageChange={setPage} />
    </div>
  )
}
