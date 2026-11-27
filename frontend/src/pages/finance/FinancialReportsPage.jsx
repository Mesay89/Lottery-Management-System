import { useState } from 'react'
import { Download } from 'lucide-react'
import { useFinancialReport } from '../../hooks/useReports'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import { exportCSV, exportPDF } from '../../services/report.service'
import { formatCurrency, formatDateTime } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function FinancialReportsPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data, isLoading } = useFinancialReport({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const rows = data?.data || []

  const handleExport = async (fmt) => {
    try {
      const fn = fmt === 'csv' ? exportCSV : exportPDF
      const res = await fn({ type: 'financial', startDate: startDate || undefined, endDate: endDate || undefined })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.setAttribute('download', `financial-report.${fmt}`)
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch {
      toast.error('Failed to export report')
    }
  }

  const columns = [
    { key: 'transactionRef', header: 'Reference', render: (r) => <span className="font-mono text-xs">{r.transactionRef}</span> },
    { key: 'type', header: 'Type', render: (r) => <span className="capitalize">{r.type?.replace('_', ' ')}</span> },
    { key: 'paymentMethod', header: 'Method', render: (r) => <span className="uppercase text-xs font-bold">{r.paymentMethod}</span> },
    { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
    { key: 'createdAt', header: 'Date', render: (r) => formatDateTime(r.createdAt) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Reports</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleExport('csv')}><Download className="w-4 h-4" /> Export CSV</Button>
          <Button onClick={() => handleExport('pdf')}><Download className="w-4 h-4" /> Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 max-w-lg gap-4">
        <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      <Table columns={columns} data={rows} isLoading={isLoading} />
    </div>
  )
}
