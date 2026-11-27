import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useUsers, useCreateUser, useActivateUser, useSuspendUser } from '../../hooks/useUsers'
import Table from '../../components/ui/Table'
import SearchBar from '../../components/ui/SearchBar'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { formatDate } from '../../lib/utils'

export default function UserManagementPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
  })

  const { data, isLoading } = useUsers({ page, limit: 10, search, role: role || undefined })
  const createUser = useCreateUser()
  const activateUser = useActivateUser()
  const suspendUser = useSuspendUser()

  const handleCreate = async (e) => {
    e.preventDefault()
    await createUser.mutateAsync(form)
    setModalOpen(false)
    setForm({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'customer' })
  }

  const columns = [
    { key: 'name', header: 'Name', render: (u) => <span className="font-medium">{u.firstName} {u.lastName}</span> },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'role', header: 'Role', render: (u) => <Badge variant="info">{u.role}</Badge> },
    { key: 'status', header: 'Status', render: (u) => <Badge variant={getStatusVariant(u.status)}>{u.status}</Badge> },
    { key: 'createdAt', header: 'Created', render: (u) => formatDate(u.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center gap-2">
          {u.status !== 'active' ? (
            <Button size="sm" variant="secondary" onClick={() => activateUser.mutate(u._id)}>Activate</Button>
          ) : (
            <Button size="sm" variant="danger" onClick={() => suspendUser.mutate(u._id)}>Suspend</Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <Button onClick={() => setModalOpen(true)}>
          <UserPlus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, phone..." />
        <div className="w-full sm:w-52">
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="All Roles"
            options={[
              { value: 'superAdmin', label: 'Super Admin' },
              { value: 'lotteryAdmin', label: 'Lottery Admin' },
              { value: 'cashManager', label: 'Cash Manager' },
              { value: 'ticketAgent', label: 'Ticket Agent' },
              { value: 'customer', label: 'Customer' },
            ]}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[
              { value: 'superAdmin', label: 'Super Admin' },
              { value: 'lotteryAdmin', label: 'Lottery Admin' },
              { value: 'cashManager', label: 'Cash Manager' },
              { value: 'ticketAgent', label: 'Ticket Agent' },
              { value: 'customer', label: 'Customer' },
            ]}
          />
          <Button type="submit" loading={createUser.isPending} className="w-full">Create User</Button>
        </form>
      </Modal>
    </div>
  )
}
