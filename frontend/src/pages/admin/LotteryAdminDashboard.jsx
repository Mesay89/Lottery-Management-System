import { Link } from 'react-router-dom'
import { Calendar, Ticket, Award, Sparkles, Plus } from 'lucide-react'
import { useLotteryAdminDashboard } from '../../hooks/useReports'
import { useEvents } from '../../hooks/useLotteryEvents'
import StatCard from '../../components/dashboard/StatCard'
import Table from '../../components/ui/Table'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { formatDate, formatCurrency } from '../../lib/utils'

export default function LotteryAdminDashboard() {
  const { data: statsRes } = useLotteryAdminDashboard()
  const { data: eventsRes, isLoading } = useEvents({ limit: 5 })

  const stats = statsRes?.data || {}
  const events = eventsRes?.data || []

  const columns = [
    { key: 'eventId', header: 'ID', render: (e) => <span className="font-mono text-xs">{e.eventId}</span> },
    { key: 'name', header: 'Event Name', render: (e) => <span className="font-medium">{e.name}</span> },
    { key: 'ticketPrice', header: 'Price', render: (e) => formatCurrency(e.ticketPrice) },
    { key: 'soldTickets', header: 'Sold', render: (e) => `${e.soldTickets} / ${e.totalTickets}` },
    { key: 'drawDate', header: 'Draw Date', render: (e) => formatDate(e.drawDate) },
    { key: 'status', header: 'Status', render: (e) => <Badge variant={getStatusVariant(e.status)}>{e.status}</Badge> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lottery Operations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage events, schedule draws, and publish results.</p>
        </div>
        <Link to="/lottery/events">
          <Button><Plus className="w-4 h-4" /> Manage Events</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Events" value={stats.totalEvents || 0} icon={Calendar} color="blue" />
        <StatCard title="Open Events" value={stats.openEvents || 0} icon={Sparkles} color="green" />
        <StatCard title="Active Tickets" value={stats.totalTickets || 0} icon={Ticket} color="purple" />
        <StatCard title="Total Winners" value={stats.totalWinners || 0} icon={Award} color="gold" />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Lottery Events</h2>
        <Table columns={columns} data={events} isLoading={isLoading} />
      </div>
    </div>
  )
}
