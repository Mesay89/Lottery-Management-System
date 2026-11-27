import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWinners, verifyWinner } from '../../services/winner.service'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import { formatCurrency } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function WinnerManagementPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['winners', page],
    queryFn: () => getWinners({ page, limit: 10 }).then((r) => r.data),
  })

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }) => verifyWinner(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['winners'] })
      toast.success('Winner verification updated')
    },
  })

  const columns = [
    { key: 'winnerId', header: 'Winner ID', render: (w) => <span className="font-mono text-xs">{w.winnerId}</span> },
    { key: 'ticket', header: 'Ticket #', render: (w) => <span className="font-mono font-semibold">{w.ticket?.ticketNumber}</span> },
    { key: 'event', header: 'Event', render: (w) => w.lotteryEvent?.name || '—' },
    { key: 'prizeRank', header: 'Rank', render: (w) => `#${w.prizeRank}` },
    { key: 'prizeAmount', header: 'Prize', render: (w) => formatCurrency(w.prizeAmount) },
    { key: 'verificationStatus', header: 'Verification', render: (w) => <Badge variant={getStatusVariant(w.verificationStatus)}>{w.verificationStatus}</Badge> },
    { key: 'claimStatus', header: 'Claim', render: (w) => <Badge variant={getStatusVariant(w.claimStatus)}>{w.claimStatus}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (w) =>
        w.verificationStatus === 'Pending' && (
          <div className="flex gap-1.5">
            <Button size="sm" onClick={() => verifyMutation.mutate({ id: w._id, status: 'Verified' })}>Verify</Button>
            <Button size="sm" variant="danger" onClick={() => verifyMutation.mutate({ id: w._id, status: 'Rejected' })}>Reject</Button>
          </div>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Winner Verification & Management</h1>
      <Table columns={columns} data={data?.data || []} isLoading={isLoading} pagination={data?.pagination} onPageChange={setPage} />
    </div>
  )
}
