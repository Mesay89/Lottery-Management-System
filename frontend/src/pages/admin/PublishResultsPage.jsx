import { useState } from 'react'
import { Send } from 'lucide-react'
import { useResults, usePublishResult } from '../../hooks/useResults'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import { formatDateTime } from '../../lib/utils'

export default function PublishResultsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useResults({ page, limit: 10 })
  const publishResult = usePublishResult()

  const columns = [
    { key: 'resultId', header: 'Result ID', render: (r) => <span className="font-mono text-xs">{r.resultId}</span> },
    { key: 'event', header: 'Event', render: (r) => r.lotteryEvent?.name || '—' },
    { key: 'totalWinners', header: 'Winners', render: (r) => r.totalWinners || 0 },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
    { key: 'publishedAt', header: 'Published At', render: (r) => formatDateTime(r.publishedAt) },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) =>
        r.status === 'Draft' ? (
          <Button size="sm" onClick={() => publishResult.mutate(r._id)} loading={publishResult.isPending}>
            <Send className="w-3.5 h-3.5" /> Publish Official Result
          </Button>
        ) : (
          <span className="text-xs text-emerald-600 font-medium">Published</span>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Publish Official Results</h1>
      <Table columns={columns} data={data?.data || []} isLoading={isLoading} pagination={data?.pagination} onPageChange={setPage} />
    </div>
  )
}
