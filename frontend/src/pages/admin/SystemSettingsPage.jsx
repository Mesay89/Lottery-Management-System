import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { useUIStore } from '../../store/uiStore'
import Button from '../../components/ui/Button'
import { OWNER_PAYMENT_ACCOUNTS } from '../../lib/constants'

export default function SystemSettingsPage() {
  const { darkMode, toggleDarkMode } = useUIStore()

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h1>

      <Card>
        <CardHeader><CardTitle>Appearance & Interface</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
            <p className="text-sm text-slate-500">Toggle between light and dark theme</p>
          </div>
          <Button variant="secondary" onClick={toggleDarkMode}>
            {darkMode ? 'Switch to Light' : 'Switch to Dark'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Owner Receiving Payment Accounts</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
            <span className="font-medium">{OWNER_PAYMENT_ACCOUNTS.telebirr.label}</span>
            <span className="font-mono font-semibold text-emerald-600">{OWNER_PAYMENT_ACCOUNTS.telebirr.displayNumber}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">{OWNER_PAYMENT_ACCOUNTS.cbe.label}</span>
            <span className="font-mono font-semibold text-blue-700 dark:text-blue-400">{OWNER_PAYMENT_ACCOUNTS.cbe.displayNumber}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
