import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Settings,
  Calendar,
  Sparkles,
  Trophy,
  Award,
  Ticket,
  CreditCard,
  BarChart3,
  CheckCircle,
  Receipt,
  X,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { cn } from '../../lib/utils'

const navByRole = {
  superAdmin: [
    { to: '/admin/dashboard', label: 'System Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/roles', label: 'Roles & Permissions', icon: Shield },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
    { to: '/lottery/events', label: 'Lottery Events', icon: Calendar },
    { to: '/lottery/draws', label: 'Draws', icon: Sparkles },
    { to: '/lottery/results', label: 'Results', icon: Trophy },
    { to: '/finance/transactions', label: 'Transactions', icon: CreditCard },
    { to: '/finance/claims', label: 'Prize Claims', icon: Award },
    { to: '/finance/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ],
  lotteryAdmin: [
    { to: '/lottery/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/lottery/events', label: 'Manage Events', icon: Calendar },
    { to: '/lottery/draws', label: 'Manage Draws', icon: Sparkles },
    { to: '/lottery/results', label: 'Publish Results', icon: Trophy },
    { to: '/lottery/winners', label: 'Winners', icon: Award },
    { to: '/lottery/tickets', label: 'Tickets Overview', icon: Ticket },
  ],
  cashManager: [
    { to: '/finance/dashboard', label: 'Finance Dashboard', icon: LayoutDashboard },
    { to: '/finance/transactions', label: 'Transactions', icon: CreditCard },
    { to: '/finance/claims', label: 'Prize Claims', icon: Award },
    { to: '/finance/reports', label: 'Financial Reports', icon: BarChart3 },
  ],
  ticketAgent: [
    { to: '/agent/dashboard', label: 'Agent Dashboard', icon: LayoutDashboard },
    { to: '/agent/register-ticket', label: 'Register Ticket', icon: Ticket },
    { to: '/agent/verify-ticket', label: 'Verify Ticket', icon: CheckCircle },
    { to: '/agent/receipts', label: 'Receipts', icon: Receipt },
  ],
  customer: [
    { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/events', label: 'Browse Events', icon: Calendar },
    { to: '/customer/tickets', label: 'My Tickets', icon: Ticket },
    { to: '/customer/claims', label: 'My Prize Claims', icon: Award },
    { to: '/customer/transactions', label: 'Transactions', icon: CreditCard },
    { to: '/results', label: 'Official Results', icon: Trophy },
  ],
}

export function Sidebar() {
  const { user } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const items = navByRole[user?.role] || navByRole.customer

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <span className="font-bold text-lg text-slate-900 dark:text-white">Menu</span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#1a7a4a] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="rounded-xl bg-gradient-to-r from-[#1a7a4a]/10 via-[#f5a623]/10 to-[#c0392b]/10 p-3 text-xs text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">OLMS v1.0</p>
            <p className="mt-0.5">Authorized Lottery Operations</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
