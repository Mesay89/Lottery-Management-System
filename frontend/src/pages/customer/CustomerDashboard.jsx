import { Link } from 'react-router-dom'
import { Ticket, Calendar, Award, CreditCard, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useMyTickets } from '../../hooks/useTickets'
import { usePublicEvents } from '../../hooks/useLotteryEvents'
import { useMyClaims } from '../../hooks/usePrizeClaims'
import StatCard from '../../components/dashboard/StatCard'
import Table from '../../components/ui/Table'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { formatDate, formatCurrency } from '../../lib/utils'

export default function CustomerDashboard() {
  const { user } = useAuthStore()
  const { data: ticketsData, isLoading: ticketsLoading } = useMyTickets({ limit: 5 })
  const { data: eventsData } = usePublicEvents({ limit: 4 })
  const { data: claimsData } = useMyClaims()

  const tickets = ticketsData?.data || []
  const events = eventsData?.data || []
  const claims = claimsData?.data || []

  const columns = [
    { key: 'ticketNumber', header: 'Ticket #', render: (r) => <span className="font-mono font-semibold">{r.ticketNumber}</span> },
    { key: 'event', header: 'Event', render: (r) => r.lotteryEvent?.name || '—' },
    { key: 'purchaseDate', header: 'Date', render: (r) => formatDate(r.purchaseDate || r.createdAt) },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (r) =>
        r.status === 'Pending' ? (
          <span className="text-xs font-medium text-amber-600">Pending Approval</span>
        ) : r.status === 'Cancelled' ? (
          <span className="text-xs font-medium text-rose-600">Cancelled</span>
        ) : (
          <Link to={`/customer/tickets/${r._id}`} className="text-xs font-semibold text-[#1a7a4a] hover:underline">
            View Ticket
          </Link>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#1a7a4a] to-emerald-800 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
          <p className="text-emerald-100 text-sm mt-1">Track your digital tickets, upcoming draws, and prize claims.</p>
        </div>
        <Link to="/customer/events">
          <Button variant="gold">
            Browse Open Events <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Tickets" value={ticketsData?.pagination?.total ?? tickets.length} icon={Ticket} color="green" />
        <StatCard title="Open Events" value={events.length} icon={Calendar} color="blue" />
        <StatCard title="My Prize Claims" value={claims.length} icon={Award} color="gold" />
        <StatCard
          title="Winning Tickets"
          value={tickets.filter((t) => t.isWinner).length}
          icon={CreditCard}
          color="purple"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Tickets</h2>
          <Link to="/customer/tickets" className="text-sm font-medium text-[#1a7a4a] hover:underline">
            View all →
          </Link>
        </div>
        <Table columns={columns} data={tickets} isLoading={ticketsLoading} emptyTitle="No tickets yet" emptyDescription="Browse open lottery events to register your first digital ticket." />
      </div>
    </div>
  )
}
