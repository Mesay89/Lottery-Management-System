import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useEvents, useCreateEvent, useOpenEvent, useCloseEvent, useApproveEvent, useDeleteEvent } from '../../hooks/useLotteryEvents'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import SearchBar from '../../components/ui/SearchBar'
import { formatCurrency, formatDate } from '../../lib/utils'

export default function ManageEventsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading } = useEvents({ page, limit: 10, search })
  const createEvent = useCreateEvent()
  const approveEvent = useApproveEvent()
  const openEvent = useOpenEvent()
  const closeEvent = useCloseEvent()
  const deleteEvent = useDeleteEvent()

  const [form, setForm] = useState({
    name: '',
    description: '',
    ticketPrice: 50,
    totalTickets: 1000,
    startDate: '',
    closingDate: '',
    drawDate: '',
    firstPrize: 100000,
  })

  const handleCreate = async (e) => {
    e.preventDefault()
    await createEvent.mutateAsync({
      name: form.name,
      description: form.description,
      ticketPrice: Number(form.ticketPrice),
      totalTickets: Number(form.totalTickets),
      startDate: form.startDate,
      closingDate: form.closingDate,
      drawDate: form.drawDate,
      prizeStructure: [{ rank: 1, description: 'First Prize', amount: Number(form.firstPrize), currency: 'ETB' }],
    })
    setModalOpen(false)
  }

  const columns = [
    { key: 'eventId', header: 'ID', render: (e) => <span className="font-mono text-xs">{e.eventId}</span> },
    { key: 'name', header: 'Name', render: (e) => <span className="font-semibold">{e.name}</span> },
    { key: 'ticketPrice', header: 'Price', render: (e) => formatCurrency(e.ticketPrice) },
    { key: 'tickets', header: 'Sold / Total', render: (e) => `${e.soldTickets} / ${e.totalTickets}` },
    { key: 'drawDate', header: 'Draw Date', render: (e) => formatDate(e.drawDate) },
    { key: 'status', header: 'Status', render: (e) => <Badge variant={getStatusVariant(e.status)}>{e.status}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (e) => (
        <div className="flex items-center gap-1.5">
          {e.status === 'Draft' && (
            <>
              <Button size="sm" variant="secondary" onClick={() => approveEvent.mutate(e._id)}>Approve</Button>
              <Button size="sm" variant="danger" onClick={() => deleteEvent.mutate(e._id)}>Delete</Button>
            </>
          )}
          {e.status === 'Scheduled' && (
            <Button size="sm" onClick={() => openEvent.mutate(e._id)}>Open Sales</Button>
          )}
          {e.status === 'Open' && (
            <Button size="sm" variant="gold" onClick={() => closeEvent.mutate(e._id)}>Close Sales</Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Lottery Events</h1>
        <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Create Event</Button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search events..." />

      <Table
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Lottery Event" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Event Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Ticket Price (ETB)" type="number" value={form.ticketPrice} onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })} required />
            <Input label="Total Tickets" type="number" value={form.totalTickets} onChange={(e) => setForm({ ...form, totalTickets: e.target.value })} required />
            <Input label="1st Prize (ETB)" type="number" value={form.firstPrize} onChange={(e) => setForm({ ...form, firstPrize: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Start Date" type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <Input label="Closing Date" type="datetime-local" value={form.closingDate} onChange={(e) => setForm({ ...form, closingDate: e.target.value })} required />
            <Input label="Draw Date" type="datetime-local" value={form.drawDate} onChange={(e) => setForm({ ...form, drawDate: e.target.value })} required />
          </div>
          <Button type="submit" loading={createEvent.isPending} className="w-full">Create Event</Button>
        </form>
      </Modal>
    </div>
  )
}
