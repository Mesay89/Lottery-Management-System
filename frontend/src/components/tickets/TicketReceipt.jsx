import { QrCode, Download, CheckCircle, Clock, XCircle } from 'lucide-react'
import Button from '../ui/Button'
import Badge, { getStatusVariant } from '../ui/Badge'
import { formatDateTime, formatCurrency } from '../../lib/utils'
import { downloadReceipt } from '../../services/ticket.service'
import toast from 'react-hot-toast'

export function TicketReceipt({ ticket }) {
  if (!ticket) return null

  const isPending = ticket.status === 'Pending'
  const isCancelled = ticket.status === 'Cancelled'
  const canAccessReceipt = ticket.status === 'Valid' || ticket.status === 'Verified'

  const handleDownload = async () => {
    try {
      const res = await downloadReceipt(ticket._id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `receipt-${ticket.ticketNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      toast.error('Failed to download PDF receipt')
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
        <div className="flex items-center gap-2 text-[#1a7a4a] dark:text-emerald-400">
          {isPending ? <Clock className="w-5 h-5 text-amber-500" /> : isCancelled ? <XCircle className="w-5 h-5 text-rose-500" /> : <CheckCircle className="w-5 h-5" />}
          <span className="font-bold text-base text-slate-900 dark:text-white">Digital Ticket Receipt</span>
        </div>
        <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
      </div>

      {isPending && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          <span className="font-semibold">Awaiting Cash Manager Approval:</span> Your payment proof is under review. You will be able to access and download your official ticket once approved.
        </div>
      )}

      {isCancelled && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
          <span className="font-semibold">Ticket Cancelled:</span> Your payment was rejected by the Cash Manager. Check your transactions page for the rejection reason.
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-2 text-sm w-full">
          <div className="flex justify-between">
            <span className="text-slate-500">Ticket Number:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{ticket.ticketNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Event:</span>
            <span className="font-medium text-slate-900 dark:text-white">{ticket.lotteryEvent?.name || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Owner:</span>
            <span className="font-medium text-slate-900 dark:text-white">{ticket.ownerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Purchase Date:</span>
            <span className="text-slate-700 dark:text-slate-300">{formatDateTime(ticket.purchaseDate || ticket.createdAt)}</span>
          </div>
          {ticket.lotteryEvent?.ticketPrice !== undefined && (
            <div className="flex justify-between">
              <span className="text-slate-500">Price Paid:</span>
              <span className="font-semibold text-[#1a7a4a]">{formatCurrency(ticket.lotteryEvent.ticketPrice)}</span>
            </div>
          )}
        </div>

        {canAccessReceipt && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center shrink-0">
            <QrCode className="w-20 h-20 text-slate-800 dark:text-slate-200" />
            <span className="text-[10px] font-mono text-slate-400 mt-1">{ticket.ticketNumber}</span>
          </div>
        )}
      </div>

      {canAccessReceipt && (
        <div className="pt-2 flex justify-end">
          <Button variant="secondary" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4" />
            Download PDF Receipt
          </Button>
        </div>
      )}
    </div>
  )
}

export default TicketReceipt
