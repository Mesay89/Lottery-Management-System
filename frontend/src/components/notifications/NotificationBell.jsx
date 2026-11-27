import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../../hooks/useNotifications'
import { formatRelativeTime } from '../../lib/utils'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { data } = useNotifications({ limit: 10 })
  const markRead = useMarkAsRead()
  const markAll = useMarkAllAsRead()

  const notifications = data?.data || []
  const unreadCount = data?.unreadCount ?? notifications.filter((n) => n.status !== 'Read').length

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#c0392b] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                className="text-xs text-[#1a7a4a] dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => n.status !== 'Read' && markRead.mutate(n._id)}
                  className={`px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                    n.status !== 'Read' ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                    {n.status !== 'Read' && <span className="w-2 h-2 rounded-full bg-[#1a7a4a] mt-1.5 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
