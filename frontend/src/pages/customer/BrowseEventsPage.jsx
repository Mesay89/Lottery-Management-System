import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Check, Building2, Smartphone, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePublicEvents } from '../../hooks/useLotteryEvents'
import { useRegisterTicket } from '../../hooks/useTickets'
import EventCard from '../../components/lottery/EventCard'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import TelebirrPayment from '../../components/payments/TelebirrPayment'
import CBEPayment from '../../components/payments/CBEPayment'
import TicketReceipt from '../../components/tickets/TicketReceipt'
import { Skeleton } from '../../components/ui/Skeleton'
import { OWNER_PAYMENT_ACCOUNTS } from '../../lib/constants'
import { formatCurrency } from '../../lib/utils'

export default function BrowseEventsPage() {
  const { data, isLoading } = usePublicEvents({ limit: 20 })
  const registerTicket = useRegisterTicket()
  const navigate = useNavigate()
  const events = data?.data || []

  const [selectedEvent, setSelectedEvent] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cbe')
  const [purchasedTicket, setPurchasedTicket] = useState(null)
  const [copiedKey, setCopiedKey] = useState(null)

  const handleCopyAccount = async (e, key, account) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(account.rawNumber)
      setCopiedKey(key)
      toast.success(`${account.label} account copied!`)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      toast.error('Could not copy account number')
    }
  }

  const handlePaymentSuccess = async (txn) => {
    const res = await registerTicket.mutateAsync({
      lotteryEvent: selectedEvent._id,
      purchaseChannel: 'online',
      transactionRef: txn?.transactionRef,
    })
    setPurchasedTicket(res.data?.data || res.data)
  }

  const closeModal = () => {
    setSelectedEvent(null)
    setPurchasedTicket(null)
  }

  const paymentOptions = [
    {
      key: 'cbe',
      account: OWNER_PAYMENT_ACCOUNTS.cbe,
      icon: Building2,
      activeBorder: 'border-blue-700 bg-blue-50/70 dark:bg-blue-950/30',
      badgeBg: 'bg-blue-900',
    },
    {
      key: 'telebirr',
      account: OWNER_PAYMENT_ACCOUNTS.telebirr,
      icon: Smartphone,
      activeBorder: 'border-[#00a651] bg-[#00a651]/5 dark:bg-[#00a651]/10',
      badgeBg: 'bg-[#00a651]',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Available Lottery Events</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Select an open event and transfer directly to CBE or Telebirr.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <EventCard key={evt._id} event={evt} onAction={setSelectedEvent} />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selectedEvent}
        onClose={closeModal}
        title={
          purchasedTicket
            ? purchasedTicket.status === 'Pending'
              ? 'Payment Submitted — Pending Approval'
              : 'Ticket Registered!'
            : `Purchase Ticket — ${selectedEvent?.name}`
        }
        size="md"
      >
        {purchasedTicket ? (
          purchasedTicket.status === 'Pending' ? (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-4">
              <Clock className="w-10 h-10 text-amber-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-amber-900">Your Ticket is Pending Approval</h3>
                <p className="text-xs text-amber-800">
                  Your payment proof for <span className="font-semibold">{selectedEvent?.name}</span> has been submitted.
                  Once the Cash Manager approves your payment, you will be able to view and access your ticket in <span className="font-semibold">My Tickets</span>.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-1">
                <Button variant="secondary" size="sm" onClick={closeModal}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    closeModal()
                    navigate('/customer/tickets')
                  }}
                >
                  Check My Tickets
                </Button>
              </div>
            </div>
          ) : (
            <TicketReceipt ticket={{ ...purchasedTicket, lotteryEvent: selectedEvent }} />
          )
        ) : (
          selectedEvent && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Ticket Price</span>
                <span className="text-xl font-bold text-[#1a7a4a]">{formatCurrency(selectedEvent.ticketPrice)}</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  1. Choose Payment Option & Copy Account
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {paymentOptions.map(({ key, account, icon: Icon, activeBorder, badgeBg }) => {
                    const isSelected = paymentMethod === key
                    const isCopied = copiedKey === key
                    return (
                      <div
                        key={key}
                        role="button"
                        tabIndex={0}
                        onClick={() => setPaymentMethod(key)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPaymentMethod(key) }}
                        className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? activeBorder
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-white shrink-0 ${badgeBg}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{account.label}</span>
                              {isSelected && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                                  Selected
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-base font-bold text-slate-900 dark:text-white">{account.displayNumber}</div>
                            <div className="text-xs font-medium text-slate-600 dark:text-slate-300">{account.accountName}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleCopyAccount(e, key, account)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600 hover:bg-indigo-50 shrink-0"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {isCopied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {paymentMethod === 'telebirr' && (
                <TelebirrPayment
                  amount={selectedEvent.ticketPrice}
                  eventId={selectedEvent._id}
                  hideAccountBox
                  onSuccess={handlePaymentSuccess}
                />
              )}
              {paymentMethod === 'cbe' && (
                <CBEPayment
                  amount={selectedEvent.ticketPrice}
                  eventId={selectedEvent._id}
                  hideAccountBox
                  onSuccess={handlePaymentSuccess}
                />
              )}
            </div>
          )
        )}
      </Modal>
    </div>
  )
}
