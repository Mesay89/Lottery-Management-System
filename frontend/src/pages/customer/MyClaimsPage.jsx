import { useState } from 'react'
import { Award } from 'lucide-react'
import { useMyClaims, useSubmitClaim } from '../../hooks/usePrizeClaims'
import { useQuery } from '@tanstack/react-query'
import { getMyWinnings } from '../../services/winner.service'
import Table from '../../components/ui/Table'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { formatCurrency, formatDate } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'

export default function MyClaimsPage() {
  const { user } = useAuthStore()
  const { data: claimsData, isLoading } = useMyClaims()
  const { data: winningsData } = useQuery({
    queryKey: ['my-winnings'],
    queryFn: () => getMyWinnings().then((r) => r.data),
  })
  const submitClaim = useSubmitClaim()

  const claims = claimsData?.data || []
  const unclaimedWinnings = (winningsData?.data || []).filter((w) => w.claimStatus === 'Unclaimed')

  const [selectedWinner, setSelectedWinner] = useState(null)
  const [form, setForm] = useState({
    fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    phone: user?.phone || '',
    nationalId: '',
    paymentMethod: 'telebirr',
    bankAccount: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await submitClaim.mutateAsync({
      winnerId: selectedWinner._id,
      paymentMethod: form.paymentMethod,
      claimantDetails: {
        fullName: form.fullName,
        phone: form.phone,
        email: user?.email,
        nationalId: form.nationalId,
        bankAccount: form.bankAccount,
      },
    })
    setSelectedWinner(null)
  }

  const columns = [
    { key: 'claimReference', header: 'Claim Ref', render: (r) => <span className="font-mono font-semibold">{r.claimReference}</span> },
    { key: 'event', header: 'Event', render: (r) => r.lotteryEvent?.name || '—' },
    { key: 'amount', header: 'Prize Amount', render: (r) => formatCurrency(r.winner?.prizeAmount || 0) },
    { key: 'paymentMethod', header: 'Method', render: (r) => <span className="uppercase text-xs font-medium">{r.paymentMethod}</span> },
    { key: 'submittedAt', header: 'Submitted', render: (r) => formatDate(r.submittedAt || r.createdAt) },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Prize Claims</h1>

      {unclaimedWinnings.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
            <Award className="w-5 h-5" />
            <span>You have {unclaimedWinnings.length} unclaimed winning ticket(s)!</span>
          </div>
          <div className="space-y-2">
            {unclaimedWinnings.map((w) => (
              <div key={w._id} className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-amber-200/60 dark:border-slate-700">
                <div className="text-sm">
                  <span className="font-mono font-bold">{w.ticket?.ticketNumber}</span> — {w.lotteryEvent?.name} (
                  <strong className="text-[#1a7a4a]">{formatCurrency(w.prizeAmount)}</strong>)
                </div>
                <Button size="sm" variant="gold" onClick={() => setSelectedWinner(w)}>
                  Submit Claim
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Table columns={columns} data={claims} isLoading={isLoading} emptyTitle="No prize claims submitted" />

      <Modal isOpen={!!selectedWinner} onClose={() => setSelectedWinner(null)} title="Submit Prize Claim">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <Input label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <Input label="National ID / Kebele ID" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} />
          <Select
            label="Payout Method"
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            options={[
              { value: 'telebirr', label: 'Telebirr' },
              { value: 'cbe', label: 'CBE Birr' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
            ]}
          />
          {form.paymentMethod === 'bank_transfer' && (
            <Input label="Bank Account Number" value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} />
          )}
          <Button type="submit" loading={submitClaim.isPending} className="w-full">
            Submit Prize Claim
          </Button>
        </form>
      </Modal>
    </div>
  )
}
