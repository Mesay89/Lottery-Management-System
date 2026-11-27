import { Link } from 'react-router-dom'
import { Ticket, CheckCircle, Receipt, ArrowRight } from 'lucide-react'
import { useTickets } from '../../hooks/useTickets'
import StatCard from '../../components/dashboard/StatCard'
import Table from '../../components/ui/Table'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { formatDateTime } from '../../lib/utils'

export default function AgentDashboard() {
  const { data, isLoading } = useTickets({ limit: 8 })
  const tickets = data?.data || []

  const columns = [
    { key: 'ticketNumber', header: 'Ticket #', render: (t) => <span className="font-mono font-semibold">{t.ticketNumber}</span> },
    { key: 'ownerName', header: 'Customer' },
    { key: 'event', header: 'Event', render: (t) => t.lotteryEvent?.name || '—' },
    { key: 'purchaseDate', header: 'Date', render: (t) => formatDateTime(t.purchaseDate || t.createdAt) },
    { key: 'status', header: 'Status', render: (t) => <Badge variant={getStatusVariant(t.status)}>{t.status}</Badge> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ticket Agent Portal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Register customer tickets, verify entries, and issue receipts.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/agent/register-ticket">
            <Button><Ticket className="w-4 h-4" /> Register Ticket</Button>
          </Link>
          <Link to="/agent/verify-ticket">
            <Button variant="secondary"><CheckCircle className="w-4 h-4" /> Verify Ticket</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Recent Sales" value={data?.pagination?.total || tickets.length} icon={Ticket} color="green" />
        <StatCard title="Verify Tickets" value="Instant" icon={CheckCircle} color="blue" />
        <StatCard title="Digital Receipts" value="PDF Ready" icon={Receipt} color="gold" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Ticket Registrations</h2>
          <Link to="/agent/receipts" className="text-sm font-medium text-[#1a7a4a] hover:underline flex items-center gap-1">
            All Receipts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <Table columns={columns} data={tickets} isLoading={isLoading} />
      </div>
    </div>
  )
}
