import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTicket } from '../../hooks/useTickets'
import TicketReceipt from '../../components/tickets/TicketReceipt'
import { PageLoader } from '../../components/ui/Spinner'

export default function TicketDetailPage() {
  const { id } = useParams()
  const { data, isLoading } = useTicket(id)
  const ticket = data?.data || data

  if (isLoading) return <PageLoader />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/customer/tickets" className="inline-flex items-center gap-1.5 text-sm text-[#1a7a4a] hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to My Tickets
      </Link>
      <TicketReceipt ticket={ticket} />
    </div>
  )
}
