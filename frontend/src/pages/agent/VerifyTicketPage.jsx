import { useState } from 'react'
import { Search, CheckCircle, XCircle } from 'lucide-react'
import { verifyTicket } from '../../services/ticket.service'
import Card, { CardContent } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import { formatDateTime, formatCurrency } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function VerifyTicketPage() {
  const [ticketNumber, setTicketNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!ticketNumber.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await verifyTicket(ticketNumber.trim())
      setResult(res.data.data)
    } catch (err) {
      toast.error(err.displayMessage || 'Ticket not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verify Digital Ticket</h1>

      <Card>
        <CardContent className="space-y-4">
          <form onSubmit={handleVerify} className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter Ticket Number (e.g. TKT-...)"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button type="submit" loading={loading}>Verify</Button>
          </form>

          {result && (
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  {result.valid ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span>{result.valid ? 'Valid Ticket' : 'Invalid / Cancelled Ticket'}</span>
                </div>
                <Badge variant={getStatusVariant(result.ticket?.status)}>{result.ticket?.status}</Badge>
              </div>
              <div className="text-sm space-y-1.5 text-slate-600 dark:text-slate-300">
                <p><strong>Ticket #:</strong> <span className="font-mono">{result.ticket?.ticketNumber}</span></p>
                <p><strong>Event:</strong> {result.ticket?.lotteryEvent?.name}</p>
                <p><strong>Owner:</strong> {result.ticket?.ownerName} ({result.ticket?.ownerPhone})</p>
                <p><strong>Purchased:</strong> {formatDateTime(result.ticket?.purchaseDate)}</p>
                {result.ticket?.isWinner && (
                  <p className="text-emerald-600 font-bold">
                    Winner! Rank #{result.ticket.prizeRank} — {formatCurrency(result.ticket.prizeAmount)}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
