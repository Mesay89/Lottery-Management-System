import { Users, Calendar, Ticket, DollarSign, Award } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useDashboardStats } from '../../hooks/useReports'
import { useUsers } from '../../hooks/useUsers'
import StatCard from '../../components/dashboard/StatCard'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import { formatCurrency, formatDate } from '../../lib/utils'
import { CHART_COLOR_ARRAY } from '../../lib/constants'

export default function SuperAdminDashboard() {
  const { data: statsRes } = useDashboardStats()
  const { data: usersRes, isLoading: usersLoading } = useUsers({ limit: 5 })

  const stats = statsRes?.data || {}
  const recentUsers = usersRes?.data || []

  const usersByRole = (stats.usersByRole || []).map((r) => ({ name: r._id, value: r.count }))
  const eventsByStatus = (stats.eventsByStatus || []).map((e) => ({ name: e._id, count: e.count }))

  const userCols = [
    { key: 'name', header: 'Name', render: (u) => `${u.firstName} ${u.lastName}` },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (u) => <Badge variant="info">{u.role}</Badge> },
    { key: 'status', header: 'Status', render: (u) => <Badge variant={getStatusVariant(u.status)}>{u.status}</Badge> },
    { key: 'createdAt', header: 'Joined', render: (u) => formatDate(u.createdAt) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Administration</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Platform-wide metrics, users, and operations overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers || 0} icon={Users} color="blue" />
        <StatCard title="Lottery Events" value={stats.totalEvents || 0} icon={Calendar} color="green" />
        <StatCard title="Tickets Sold" value={stats.totalTickets || 0} icon={Ticket} color="purple" />
        <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue || 0)} icon={DollarSign} color="gold" />
        <StatCard title="Pending Claims" value={stats.pendingClaims || 0} icon={Award} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Events by Status</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsByStatus}>
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#1a7a4a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Users by Role</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={usersByRole} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {usersByRole.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLOR_ARRAY[idx % CHART_COLOR_ARRAY.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Users</h2>
        <Table columns={userCols} data={recentUsers} isLoading={usersLoading} />
      </div>
    </div>
  )
}
