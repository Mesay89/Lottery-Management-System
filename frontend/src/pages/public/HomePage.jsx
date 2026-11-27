import { Link, useNavigate } from 'react-router-dom'
import { Ticket, Trophy, ShieldCheck, Smartphone, ArrowRight, Sparkles } from 'lucide-react'
import Button from '../../components/ui/Button'
import EventCard from '../../components/lottery/EventCard'
import { usePublicEvents } from '../../hooks/useLotteryEvents'
import { useResults } from '../../hooks/useResults'
import { useAuthStore } from '../../store/authStore'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDate } from '../../lib/utils'

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { data: eventsData, isLoading: eventsLoading } = usePublicEvents({ limit: 3 })
  const { data: resultsData } = useResults({ limit: 3 })

  const events = eventsData?.data || []
  const results = resultsData?.data || []

  const handleGetTicket = (event) => {
    if (!isAuthenticated) {
      navigate('/login')
    } else {
      navigate(`/customer/events?select=${event._id}`)
    }
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0f3d26] to-slate-900 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#f5a623,transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Authorized Ethiopian Digital Lottery Platform</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Transparent Draws.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] to-emerald-400">
                  Digital Tickets.
                </span>
              </h1>
              <p className="text-lg text-slate-300 max-w-xl">
                Register digital lottery tickets, track official draws in real time, and claim prizes seamlessly with Telebirr and CBE Birr.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/results">
                  <Button size="lg" variant="gold">
                    <Trophy className="w-5 h-5" />
                    Check Your Results
                  </Button>
                </Link>
                <Link to={isAuthenticated ? '/customer/events' : '/register'}>
                  <Button size="lg" variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    {isAuthenticated ? 'Browse Events' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Animated Lottery Balls Visual */}
            <div className="hidden lg:flex flex-col items-center justify-center">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-8 w-full max-w-md space-y-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-300">Live Draw Integrity</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300">Verified</span>
                </div>
                <div className="flex items-center justify-center gap-3 py-4">
                  {['07', '19', '24', '38', '42'].map((num, idx) => (
                    <div
                      key={num}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f5a623] to-amber-600 text-slate-900 font-extrabold text-xl flex items-center justify-center shadow-lg animate-bounce"
                      style={{ animationDelay: `${idx * 150}ms`, animationDuration: '2.5s' }}
                    >
                      {num}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 text-center pt-2 border-t border-white/10">
                  <div>
                    <p className="text-xl font-bold text-white">100%</p>
                    <p className="text-xs text-slate-400">Auditable</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#f5a623]">ETB</p>
                    <p className="text-xs text-slate-400">Telebirr & CBE</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-emerald-400">24/7</p>
                    <p className="text-xs text-slate-400">Verification</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Lottery Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Active Lottery Events</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Participate in authorized upcoming draws.</p>
          </div>
          <Link to="/customer/events" className="text-sm font-semibold text-[#1a7a4a] dark:text-emerald-400 hover:underline flex items-center gap-1">
            View all events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500">
            No active lottery events at the moment. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <EventCard key={evt._id} event={evt} onAction={handleGetTicket} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">How It Works</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Simple, secure, and transparent from ticket registration to prize payout.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Ticket, title: '1. Register Digital Ticket', desc: 'Choose an open lottery event and pay securely via Telebirr or CBE Birr.' },
              { icon: ShieldCheck, title: '2. Transparent Draw', desc: 'Authorized operators conduct audited draws with full verification records.' },
              { icon: Smartphone, title: '3. Claim Your Prize', desc: 'Check official results online and submit eligible prize claims directly from your dashboard.' },
            ].map((step) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1a7a4a]/10 text-[#1a7a4a] dark:text-emerald-400 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Recent Results */}
      {results.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Official Results</h2>
            <Link to="/results" className="text-sm font-semibold text-[#1a7a4a] dark:text-emerald-400 hover:underline">
              All Results →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.map((r) => (
              <div key={r._id} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 dark:text-white">{r.lotteryEvent?.name || 'Lottery Draw'}</h4>
                  <span className="text-xs text-slate-400">{formatDate(r.publishedAt)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(r.winningNumbers || []).map((n, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 font-mono text-xs font-bold">
                      {n}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500">Total Winners: {r.totalWinners || 0}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
