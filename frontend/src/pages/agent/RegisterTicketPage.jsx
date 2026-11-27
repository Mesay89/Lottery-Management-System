import { useState } from 'react'
import { usePublicEvents } from '../../hooks/useLotteryEvents'
import { useRegisterTicket } from '../../hooks/useTickets'
import Card, { CardContent } from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import PaymentMethodSelector from '../../components/payments/PaymentMethodSelector'
import TelebirrPayment from '../../components/payments/TelebirrPayment'
import CBEPayment from '../../components/payments/CBEPayment'
import TicketReceipt from '../../components/tickets/TicketReceipt'
import { formatCurrency } from '../../lib/utils'

export default function RegisterTicketPage() {
  const { data: eventsRes } = usePublicEvents({ limit: 50 })
  const registerTicket = useRegisterTicket()
  const events = (eventsRes?.data || []).filter((e) => e.status === 'Open')

  const [eventId, setEventId] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [createdTicket, setCreatedTicket] = useState(null)

  const selectedEvent = events.find((e) => e._id === eventId)

  const completeRegistration = async (txn) => {
    const res = await registerTicket.mutateAsync({
      lotteryEvent: eventId,
      ownerName,
      ownerPhone,
      ownerEmail: ownerEmail || undefined,
      purchaseChannel: 'agent',
      transactionRef: txn?.transactionRef,
    })
    setCreatedTicket({ ...(res.data?.data || res.data), lotteryEvent: selectedEvent })
  }

  const handleCashSubmit = async (e) => {
    e.preventDefault()
    await completeRegistration({ transactionRef: `CASH-${Date.now()}` })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Register Customer Ticket</h1>

      {createdTicket ? (
        <div className="space-y-4">
          <TicketReceipt ticket={createdTicket} />
          <Button
            variant="secondary"
            onClick={() => {
              setCreatedTicket(null)
              setOwnerName('')
              setOwnerPhone('')
              setOwnerEmail('')
            }}
          >
            Register Another Ticket
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-5">
            <Select
              label="Select Open Lottery Event"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="Choose event..."
              options={events.map((ev) => ({
                value: ev._id,
                label: `${ev.name} — ${formatCurrency(ev.ticketPrice)} (${ev.remainingTickets} left)`,
              }))}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Customer Full Name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
              <Input label="Customer Phone" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} required />
            </div>
            <Input label="Customer Email (optional)" type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />

            {selectedEvent && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Payment Method</label>
                <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} includeCash />

                {paymentMethod === 'cash' && (
                  <Button
                    onClick={handleCashSubmit}
                    loading={registerTicket.isPending}
                    disabled={!ownerName || !ownerPhone}
                    className="w-full"
                    size="lg"
                  >
                    Confirm Cash Payment ({formatCurrency(selectedEvent.ticketPrice)}) & Issue Ticket
                  </Button>
                )}
                {paymentMethod === 'telebirr' && (
                  <TelebirrPayment amount={selectedEvent.ticketPrice} eventId={selectedEvent._id} onSuccess={completeRegistration} />
                )}
                {paymentMethod === 'cbe' && (
                  <CBEPayment amount={selectedEvent.ticketPrice} eventId={selectedEvent._id} onSuccess={completeRegistration} />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
