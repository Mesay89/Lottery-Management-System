import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const roleDefinitions = [
  { name: 'superAdmin', label: 'Super Administrator', permissions: ['Manage all users & admins', 'System settings', 'View audit logs', 'Full access'] },
  { name: 'lotteryAdmin', label: 'Lottery Administrator', permissions: ['Create & manage lottery events', 'Schedule & conduct draws', 'Publish official results', 'Verify winners'] },
  { name: 'cashManager', label: 'Cash Manager / Financial Officer', permissions: ['Review all transactions', 'Approve & pay prize claims', 'Generate financial reports'] },
  { name: 'ticketAgent', label: 'Ticket Agent', permissions: ['Register customer tickets', 'Verify tickets', 'Generate PDF receipts'] },
  { name: 'customer', label: 'Customer', permissions: ['Browse open events', 'Purchase tickets via Telebirr/CBE', 'View results & submit prize claims'] },
]

export default function RoleManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Roles & Permissions</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Role-Based Access Control (RBAC) definitions enforced across APIs and UI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roleDefinitions.map((r) => (
          <Card key={r.name}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{r.label}</CardTitle>
              <Badge variant="info">{r.name}</Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                {r.permissions.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
