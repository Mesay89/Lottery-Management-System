import { Calendar, Ticket, Trophy } from 'lucide-react'
import Badge, { getStatusVariant } from '../ui/Badge'
import Button from '../ui/Button'
import CountdownTimer from './CountdownTimer'
import { formatCurrency, formatDate } from '../../lib/utils'

export function EventCard({ event, onAction, actionLabel = 'Get Ticket' }) {
  const totalPrize = (event.prizeStructure || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
      <div className="h-32 bg-gradient-to-br from-[#1a7a4a] via-emerald-700 to-slate-900 p-5 flex flex-col justify-between text-white relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur">
            {event.eventId}
          </span>
          <Badge variant={getStatusVariant(event.status)}>{event.status}</Badge>
        </div>
        <h3 className="text-lg font-bold line-clamp-1">{event.name}</h3>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{event.description}</p>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <span className="text-slate-500 dark:text-slate-400 block">Ticket Price</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(event.ticketPrice)}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Prize Pool
            </span>
            <span className="text-sm font-bold text-amber-900 dark:text-amber-300">{formatCurrency(totalPrize)}</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Draw Date</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(event.drawDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1"><Ticket className="w-3.5 h-3.5" /> Remaining</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {event.remainingTickets} / {event.totalTickets}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
          <CountdownTimer targetDate={event.drawDate} />
          {onAction && (
            <Button
              size="sm"
              disabled={event.status !== 'Open'}
              onClick={() => onAction(event)}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventCard
