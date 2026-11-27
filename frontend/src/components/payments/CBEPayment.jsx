import { Building2 } from 'lucide-react'
import { OWNER_PAYMENT_ACCOUNTS } from '../../lib/constants'
import { initiateCBE } from '../../services/transaction.service'
import { DirectTransferPayment } from './DirectTransferPayment'

export function CBEPayment({ amount, eventId, ticketId, hideAccountBox, onSuccess }) {
  const account = OWNER_PAYMENT_ACCOUNTS.cbe

  return (
    <DirectTransferPayment
      providerName={account.label}
      accountName={account.accountName}
      accountDisplay={account.displayNumber}
      accountRaw={account.rawNumber}
      refPlaceholder="e.g. FT25123ABCDE"
      accentClasses={{
        container: 'bg-blue-950/5 border-blue-900/20',
        badge: 'bg-blue-900',
        title: 'text-blue-950',
        subtitle: 'text-blue-800',
        button: 'bg-blue-900 hover:bg-blue-950',
      }}
      icon={Building2}
      amount={amount}
      eventId={eventId}
      ticketId={ticketId}
      hideAccountBox={hideAccountBox}
      submitPayment={initiateCBE}
      onSuccess={onSuccess}
    />
  )
}

export default CBEPayment
