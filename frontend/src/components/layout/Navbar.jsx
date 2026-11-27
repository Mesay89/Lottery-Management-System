import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Menu, Moon, Sun, LogOut, Ticket, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import NotificationBell from '../notifications/NotificationBell'
import Button from '../ui/Button'
import { getInitials } from '../../lib/utils'

export function Navbar({ isPublic = false }) {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { darkMode, toggleDarkMode, toggleSidebar } = useUIStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleLogout = () => {
    logout()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'superAdmin':
        return '/admin/dashboard'
      case 'lotteryAdmin':
        return '/lottery/dashboard'
      case 'cashManager':
        return '/finance/dashboard'
      case 'ticketAgent':
        return '/agent/dashboard'
      default:
        return '/customer/dashboard'
    }
  }

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {!isPublic && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a7a4a] via-[#f5a623] to-[#c0392b] flex items-center justify-center text-white shadow-sm">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">OLMS</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-[#1a7a4a] dark:bg-emerald-900/40 dark:text-emerald-300">
              Ethiopia
            </span>
          </div>
        </Link>
      </div>

      {isPublic && (
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link to="/" className="hover:text-[#1a7a4a] dark:hover:text-emerald-400 transition-colors">Home</Link>
          <Link to="/results" className="hover:text-[#1a7a4a] dark:hover:text-emerald-400 transition-colors">Official Results</Link>
          {isAuthenticated && (
            <Link to={getDashboardLink()} className="hover:text-[#1a7a4a] dark:hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
          )}
        </nav>
      )}

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {isAuthenticated ? (
          <>
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-full bg-[#1a7a4a] text-white text-xs font-bold flex items-center justify-center">
                {getInitials(`${user?.firstName || ''} ${user?.lastName || ''}`) || <User className="w-4 h-4" />}
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
            {isPublic && (
              <Button size="sm" onClick={() => navigate(getDashboardLink())}>
                Dashboard
              </Button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
