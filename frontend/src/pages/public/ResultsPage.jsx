import { useState } from 'react'
import { Trophy, Search, CheckCircle, XCircle } from 'lucide-react'
import { useResults } from '../../hooks/useResults'
import { verifyTicket } from '../../services/ticket.service'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Card, { CardContent } from '../../components/ui/Card'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDate, formatCurrency } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function ResultsPage() {
  const { isAuthenticated } = useAuthStore()
  const { data, isLoading } = useResults({ limit: 20 })
  const results = data?.data || []

  const [ticketNum, setTicketNum] = useState('')
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState(null)

  const handleCheckTicket = async (e) => {
    e.preventDefault()
    if (!ticketNum.trim()) return
    if (!isAuthenticated) {
      toast.error('Please login to verify individual ticket numbers.')
      return
    }
    setChecking(true)
    setCheckResult(null)
    try {
      const res = await verifyTicket(ticketNum.trim())
      setCheckResult(res.data.data)
    } catch (err) {
      toast.error(err.displayMessage || 'Ticket not found')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <Trophy className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Official Lottery Results</h1>
        <p className="text-slate-600 dark:text-slate-400">
          View published official draw results and verify your digital ticket status.
        </p>
      </div>

      {/* Ticket Checker */}
      <Card className="max-w-xl mx-auto">
        <CardContent>
          <form onSubmit={handleCheckTicket} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter Ticket Number (e.g. TKT-20261126-XXXXX)"
                value={ticketNum}
                onChange={(e) => setTicketNum(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button type="submit" loading={checking}>Check Ticket</Button>
          </form>

          {checkResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 font-semibold">
                {checkResult.ticket?.isWinner ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-emerald-700 dark:text-emerald-400">
                      Congratulations! Winning Ticket (Rank #{checkResult.ticket.prizeRank} - {formatCurrency(checkResult.ticket.prizeAmount)})
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Ticket {checkResult.ticket?.ticketNumber} is {checkResult.ticket?.status} (No win recorded).
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Published Results List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500">
          No official results published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((r) => (
            <Card key={r._id}>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400">{r.resultId}</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {r.lotteryEvent?.name || 'Lottery Event'}
                    </h3>
                  </div>
                  <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-2">Winning Numbers / Codes</p>
                  <div className="flex flex-wrap gap-2">
                    {(r.winningNumbers || []).length > 0 ? (
                      r.winningNumbers.map((num, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-full bg-gradient-to-br from-[#f5a623] to-amber-500 text-slate-900 font-mono font-bold text-sm shadow-sm"
                        >
                          {num}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">Ticket-based draw ({r.totalWinners} winners)</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
                  <span>Published: {formatDate(r.publishedAt)}</span>
                  <span>Total Winners: <strong className="text-slate-900 dark:text-white">{r.totalWinners}</strong></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
