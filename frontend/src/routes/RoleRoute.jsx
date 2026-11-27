import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function RoleRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-slate-600 dark:text-slate-400">
          You do not have permission to view this page.
        </p>
      </div>
    )
  }

  return children
}

export default RoleRoute
