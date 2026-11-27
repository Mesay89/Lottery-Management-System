import { useState } from 'react'
import { usePrizeClaims, useReviewClaim, useApproveClaim, useRejectClaim, useMarkClaimAsPaid } from '../../hooks/usePrizeClaims'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { formatCurrency, formatDate } from '../../lib/utils'

export default function PrizeClaimsPage() {
  const [page, setPage] = useState(1)
  const [payModal, setPayModal] = useState(null)
  const [paymentRef, setPaymentRef] = useState('')

  const { data, isLoading } = usePrizeClaims({ page, limit: 10 })
  const reviewClaim = useReviewClaim()
  const approveClaim = useApproveClaim()
  const rejectClaim = useRejectClaim()
  const markPaid = useMarkClaimAsPaid()

  const handleMarkPaid = async (e) => {
    e.preventDefault()
    await markPaid.mutateAsync({ id: payModal._id, paymentReference: paymentRef })
    setPayModal(null)
    setPaymentRef('')
  }

  const columns = [
    { key: 'claimReference', header: 'Claim Ref', render: (c) => <span className="font-mono text-xs font-semibold">{c.claimReference}</span> },
    { key: 'customer', header: 'Claimant', render: (c) => c.claimantDetails?.fullName || `${c.customer?.firstName || ''} ${c.customer?.lastName || ''}` },
    { key: 'event', header: 'Event', render: (c) => c.lotteryEvent?.name || '—' },
    { key: 'amount', header: 'Prize', render: (c) => formatCurrency(c.winner?.prizeAmount || 0) },
    { key: 'paymentMethod', header: 'Method', render: (c) => <span className="uppercase text-xs font-bold">{c.paymentMethod}</span> },
    { key: 'submittedAt', header: 'Date', render: (c) => formatDate(c.submittedAt || c.createdAt) },
    { key: 'status', header: 'Status', render: (c) => <Badge variant={getStatusVariant(c.status)}>{c.status}</Badge> },
    {
      key: 'actions',
      header: 'Workflow',
      render: (c) => (
        <div className="flex items-center gap-1.5">
          {c.status === 'Submitted' && (
            <Button size="sm" variant="secondary" onClick={() => reviewClaim.mutate({ id: c._id })}>Review</Button>
          )}
          {['Submitted', 'Under Review'].includes(c.status) && (
            <>
              <Button size="sm" onClick={() => approveClaim.mutate(c._id)}>Approve</Button>
              <Button size="sm" variant="danger" onClick={() => rejectClaim.mutate({ id: c._id, reason: 'Verification failed' })}>Reject</Button>
            </>
          )}
          {c.status === 'Approved' && (
            <Button size="sm" variant="gold" onClick={() => setPayModal(c)}>Mark Paid</Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Prize Claims Review & Payouts</h1>
      <Table columns={columns} data={data?.data || []} isLoading={isLoading} pagination={data?.pagination} onPageChange={setPage} />

      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Record Prize Payment">
        <form onSubmit={handleMarkPaid} className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Recording payout for <strong>{payModal?.claimReference}</strong>
          </p>
          <Input
            label="Payment Transaction Reference"
            placeholder="e.g. TXN-TELEBIRR-12345"
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
            required
          />
          <Button type="submit" loading={markPaid.isPending} className="w-full">Confirm Payout</Button>
        </form>
      </Modal>
    </div>
  )
}
