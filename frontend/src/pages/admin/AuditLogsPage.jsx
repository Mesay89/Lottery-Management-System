import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '../../services/auditLog.service'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { formatDateTime } from '../../lib/utils'

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () => getAuditLogs({ page, limit: 15 }).then((r) => r.data),
  })

  const columns = [
    { key: 'action', header: 'Action', render: (r) => <Badge variant="info">{r.action}</Badge> },
    { key: 'resource', header: 'Resource' },
    { key: 'performedBy', header: 'User', render: (r) => r.performedBy ? `${r.performedBy.firstName} ${r.performedBy.lastName}` : 'System' },
    { key: 'description', header: 'Description' },
    { key: 'ipAddress', header: 'IP Address' },
    { key: 'performedAt', header: 'Timestamp', render: (r) => formatDateTime(r.performedAt || r.createdAt) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Logs</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Immutable security & administrative activity trail.</p>
      </div>
      <Table
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
      />
    </div>
  )
}
