import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from '../components/layout/PublicLayout'
import DashboardLayout from '../components/layout/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'

// Public Pages
import HomePage from '../pages/public/HomePage'
import ResultsPage from '../pages/public/ResultsPage'
import LoginPage from '../pages/public/LoginPage'
import RegisterPage from '../pages/public/RegisterPage'
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage'
import ResetPasswordPage from '../pages/public/ResetPasswordPage'

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard'
import BrowseEventsPage from '../pages/customer/BrowseEventsPage'
import MyTicketsPage from '../pages/customer/MyTicketsPage'
import TicketDetailPage from '../pages/customer/TicketDetailPage'
import MyClaimsPage from '../pages/customer/MyClaimsPage'
import MyTransactionsPage from '../pages/customer/MyTransactionsPage'

// Admin Pages
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard'
import UserManagementPage from '../pages/admin/UserManagementPage'
import RoleManagementPage from '../pages/admin/RoleManagementPage'
import AuditLogsPage from '../pages/admin/AuditLogsPage'
import SystemSettingsPage from '../pages/admin/SystemSettingsPage'
import LotteryAdminDashboard from '../pages/admin/LotteryAdminDashboard'
import ManageEventsPage from '../pages/admin/ManageEventsPage'
import ManageDrawsPage from '../pages/admin/ManageDrawsPage'
import PublishResultsPage from '../pages/admin/PublishResultsPage'
import WinnerManagementPage from '../pages/admin/WinnerManagementPage'
import TicketOverviewPage from '../pages/admin/TicketOverviewPage'

// Finance Pages
import FinanceDashboard from '../pages/finance/FinanceDashboard'
import TransactionsPage from '../pages/finance/TransactionsPage'
import PrizeClaimsPage from '../pages/finance/PrizeClaimsPage'
import FinancialReportsPage from '../pages/finance/FinancialReportsPage'

// Agent Pages
import AgentDashboard from '../pages/agent/AgentDashboard'
import RegisterTicketPage from '../pages/agent/RegisterTicketPage'
import VerifyTicketPage from '../pages/agent/VerifyTicketPage'
import ReceiptsPage from '../pages/agent/ReceiptsPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Customer */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/events" element={<BrowseEventsPage />} />
        <Route path="/customer/tickets" element={<MyTicketsPage />} />
        <Route path="/customer/tickets/:id" element={<TicketDetailPage />} />
        <Route path="/customer/claims" element={<MyClaimsPage />} />
        <Route path="/customer/transactions" element={<MyTransactionsPage />} />

        {/* Super Admin */}
        <Route path="/admin/dashboard" element={<RoleRoute allowedRoles={['superAdmin']}><SuperAdminDashboard /></RoleRoute>} />
        <Route path="/admin/users" element={<RoleRoute allowedRoles={['superAdmin']}><UserManagementPage /></RoleRoute>} />
        <Route path="/admin/roles" element={<RoleRoute allowedRoles={['superAdmin']}><RoleManagementPage /></RoleRoute>} />
        <Route path="/admin/audit-logs" element={<RoleRoute allowedRoles={['superAdmin']}><AuditLogsPage /></RoleRoute>} />
        <Route path="/admin/settings" element={<RoleRoute allowedRoles={['superAdmin']}><SystemSettingsPage /></RoleRoute>} />

        {/* Lottery Admin */}
        <Route path="/lottery/dashboard" element={<RoleRoute allowedRoles={['superAdmin', 'lotteryAdmin']}><LotteryAdminDashboard /></RoleRoute>} />
        <Route path="/lottery/events" element={<RoleRoute allowedRoles={['superAdmin', 'lotteryAdmin']}><ManageEventsPage /></RoleRoute>} />
        <Route path="/lottery/draws" element={<RoleRoute allowedRoles={['superAdmin', 'lotteryAdmin']}><ManageDrawsPage /></RoleRoute>} />
        <Route path="/lottery/results" element={<RoleRoute allowedRoles={['superAdmin', 'lotteryAdmin']}><PublishResultsPage /></RoleRoute>} />
        <Route path="/lottery/winners" element={<RoleRoute allowedRoles={['superAdmin', 'lotteryAdmin']}><WinnerManagementPage /></RoleRoute>} />
        <Route path="/lottery/tickets" element={<RoleRoute allowedRoles={['superAdmin', 'lotteryAdmin']}><TicketOverviewPage /></RoleRoute>} />

        {/* Finance */}
        <Route path="/finance/dashboard" element={<RoleRoute allowedRoles={['superAdmin', 'cashManager']}><FinanceDashboard /></RoleRoute>} />
        <Route path="/finance/transactions" element={<RoleRoute allowedRoles={['superAdmin', 'cashManager']}><TransactionsPage /></RoleRoute>} />
        <Route path="/finance/claims" element={<RoleRoute allowedRoles={['superAdmin', 'cashManager', 'lotteryAdmin']}><PrizeClaimsPage /></RoleRoute>} />
        <Route path="/finance/reports" element={<RoleRoute allowedRoles={['superAdmin', 'cashManager']}><FinancialReportsPage /></RoleRoute>} />

        {/* Ticket Agent */}
        <Route path="/agent/dashboard" element={<RoleRoute allowedRoles={['superAdmin', 'ticketAgent']}><AgentDashboard /></RoleRoute>} />
        <Route path="/agent/register-ticket" element={<RoleRoute allowedRoles={['superAdmin', 'ticketAgent']}><RegisterTicketPage /></RoleRoute>} />
        <Route path="/agent/verify-ticket" element={<RoleRoute allowedRoles={['superAdmin', 'ticketAgent']}><VerifyTicketPage /></RoleRoute>} />
        <Route path="/agent/receipts" element={<RoleRoute allowedRoles={['superAdmin', 'ticketAgent']}><ReceiptsPage /></RoleRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
