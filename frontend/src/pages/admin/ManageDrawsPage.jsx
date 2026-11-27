import { useState } from 'react'
import { Plus, Play, CheckCircle } from 'lucide-react'
import { useDraws, useScheduleDraw, useStartDraw, useCompleteDraw } from '../../hooks/useDraws'
import { useEvents } from '../../hooks/useLotteryEvents'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import { formatDateTime } from '../../lib/utils'

export default function ManageDrawsPage() {
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ lotteryEvent: '', scheduledDate: '', drawMethod: 'random' })

  const { data, isLoading } = useDraws({ page, limit: 10 })
  const { data: eventsData } = useEvents({ limit: 50 })
  const scheduleDraw = useScheduleDraw()
  const startDraw = useStartDraw()
  const completeDraw = useCompleteDraw()

  const events = eventsData?.data || []

  const handleSchedule = async (e) => {
    e.preventDefault()
    await scheduleDraw.mutateAsync(form)
    setModalOpen(false)
  }

  const columns = [
    { key: 'drawId', header: 'Draw ID', render: (d) => <span className="font-mono text-xs font-semibold">{d.drawId}</span> },
    { key: 'event', header: 'Lottery Event', render: (d) => d.lotteryEvent?.name || '—' },
    { key: 'scheduledDate', header: 'Scheduled Date', render: (d) => formatDateTime(d.scheduledDate) },
    { key: 'drawMethod', header: 'Method', render: (d) => <span className="capitalize">{d.drawMethod}</span> },
    { key: 'status', header: 'Status', render: (d) => <Badge variant={getStatusVariant(d.status)}>{d.status}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (d) => (
        <div className="flex items-center gap-2">
          {d.status === 'Scheduled' && (
            <Button size="sm" variant="secondary" onClick={() => startDraw.mutate(d._id)}>
              <Play className="w-3.5 h-3.5" /> Start
            </Button>
          )}
          {['Scheduled', 'InProgress'].includes(d.status) && (
            <Button size="sm" onClick={() => completeDraw.mutate(d._id)}>
              <CheckCircle className="w-3.5 h-3.5" /> Complete Draw
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Lottery Draws</h1>
        <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Schedule Draw</Button>
      </div>

      <Table columns={columns} data={data?.data || []} isLoading={isLoading} pagination={data?.pagination} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Lottery Draw">
        <form onSubmit={handleSchedule} className="space-y-4">
          <Select
            label="Lottery Event"
            value={form.lotteryEvent}
            onChange={(e) => setForm({ ...form, lotteryEvent: e.target.value })}
            placeholder="Select an event"
            options={events.map((ev) => ({ value: ev._id, label: `${ev.name} (${ev.status})` }))}
            required
          />
          <Input
            label="Scheduled Date & Time"
            type="datetime-local"
            value={form.scheduledDate}
            onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
            required
          />
          <Select
            label="Draw Method"
            value={form.drawMethod}
            onChange={(e) => setForm({ ...form, drawMethod: e.target.value })}
            options={[
              { value: 'random', label: 'Automated Random Selection' },
              { value: 'manual', label: 'Manual Entry' },
              { value: 'hybrid', label: 'Hybrid' },
            ]}
          />
          <Button type="submit" loading={scheduleDraw.isPending} className="w-full">Schedule Draw</Button>
        </form>
      </Modal>
    </div>
  )
}
