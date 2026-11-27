import { useState } from 'react'
import { Download } from 'lucide-react'
import { useTickets } from '../../hooks/useTickets'
import { downloadReceipt } from '../../services/ticket.service'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import { formatDateTime } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function ReceiptsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useTickets({ page, limit: 10 })

  const handleDownload = async (ticket) => {
    try {
      const res = await downloadReceipt(ticket._id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.setAttribute('download', `receipt-${ticket.ticketNumber}.pdf`)
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch {
      toast.error('Failed to download receipt')
    }
  }

  const columns = [
    { key: 'ticketNumber', header: 'Ticket #', render: (t) => <span className="font-mono font-semibold">{t.ticketNumber}</span> },
    { key: 'ownerName', header: 'Customer' },
    { key: 'event', header: 'Event', render: (t) => t.lotteryEvent?.name || '—' },
    { key: 'purchaseDate', header: 'Date', render: (t) => formatDateTime(t.purchaseDate || t.createdAt) },
    { key: 'status', header: 'Status', render: (t) => <Badge variant={getStatusVariant(t.status)}>{t.status}</Badge> },
    {
      key: 'actions',
      header: 'Receipt',
      render: (t) => (
        <Button size="sm" variant="secondary" onClick={() => handleDownload(t)}>
          <Download className="w-3.5 h-3.5" /> PDF
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transaction & Ticket Receipts</h1>
      <Table columns={columns} data={data?.data || []} isLoading={isLoading} pagination={data?.pagination} onPageChange={setPage} />
    </div>
  )
}
