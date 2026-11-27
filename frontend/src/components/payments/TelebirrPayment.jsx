import { Smartphone } from 'lucide-react'
import { OWNER_PAYMENT_ACCOUNTS } from '../../lib/constants'
import { initiateTelebirr } from '../../services/transaction.service'
import { DirectTransferPayment } from './DirectTransferPayment'

export function TelebirrPayment({ amount, eventId, ticketId, hideAccountBox, onSuccess }) {
  const account = OWNER_PAYMENT_ACCOUNTS.telebirr

  return (
    <DirectTransferPayment
      providerName={account.label}
      accountName={account.accountName}
      accountDisplay={account.displayNumber}
      accountRaw={account.rawNumber}
      refPlaceholder="e.g. BL12AB34CD"
      accentClasses={{
        container: 'bg-[#00a651]/5 border-[#00a651]/20',
        badge: 'bg-[#00a651]',
        title: 'text-[#006b34]',
        subtitle: 'text-[#008040]',
        button: 'bg-[#00a651] hover:bg-[#008f45]',
      }}
      icon={Smartphone}
      amount={amount}
      eventId={eventId}
      ticketId={ticketId}
      hideAccountBox={hideAccountBox}
      submitPayment={initiateTelebirr}
      onSuccess={onSuccess}
    />
  )
}

export default TelebirrPayment
