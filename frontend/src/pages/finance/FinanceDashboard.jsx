import { DollarSign, Award, CreditCard, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useFinanceDashboard } from '../../hooks/useReports'
import StatCard from '../../components/dashboard/StatCard'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import { formatCurrency, formatDateTime } from '../../lib/utils'

export default function FinanceDashboard() {
  const { data: res, isLoading } = useFinanceDashboard()
  const stats = res?.data || {}
  const byMethod = (stats.revenueByMethod || []).map((m) => ({
    method: m._id?.toUpperCase() || 'OTHER',
    total: m.total,
    count: m.count,
  }))

  const cols = [
    { key: 'transactionRef', header: 'Ref', render: (t) => <span className="font-mono text-xs">{t.transactionRef}</span> },
    { key: 'customer', header: 'Customer', render: (t) => t.customer ? `${t.customer.firstName} ${t.customer.lastName}` : '—' },
    { key: 'paymentMethod', header: 'Method', render: (t) => <span className="uppercase text-xs font-semibold">{t.paymentMethod}</span> },
    { key: 'amount', header: 'Amount', render: (t) => formatCurrency(t.amount) },
    { key: 'status', header: 'Status', render: (t) => <Badge variant={getStatusVariant(t.status)}>{t.status}</Badge> },
    { key: 'createdAt', header: 'Date', render: (t) => formatDateTime(t.createdAt) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Monitor Telebirr, CBE Birr, ticket revenue, and prize payouts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue || 0)} icon={DollarSign} color="green" />
        <StatCard title="Prizes Paid" value={formatCurrency(stats.totalPrizesPaid || 0)} icon={TrendingUp} color="blue" />
        <StatCard title="Pending Claims" value={stats.pendingClaims || 0} icon={Award} color="gold" />
        <StatCard title="Net Balance" value={formatCurrency((stats.totalRevenue || 0) - (stats.totalPrizesPaid || 0))} icon={CreditCard} color="purple" />
      </div>

      <Card>
        <CardHeader><CardTitle>Revenue by Payment Method (ETB)</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byMethod}>
              <XAxis dataKey="method" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="total" fill="#1a7a4a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
        <Table columns={cols} data={stats.recentTransactions || []} isLoading={isLoading} />
      </div>
    </div>
  )
}
