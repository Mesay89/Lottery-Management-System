import { useQuery } from '@tanstack/react-query'
import * as reportService from '../services/report.service'
import { QUERY_KEYS } from '../lib/constants'

export const useDashboardStats = () =>
  useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'dashboard'],
    queryFn: () => reportService.getDashboardStats().then((r) => r.data),
  })

export const useAdminDashboardStats = () =>
  useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'admin-dashboard'],
    queryFn: () => reportService.getAdminDashboardStats().then((r) => r.data),
  })

export const useFinanceDashboardStats = () =>
  useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'finance-dashboard'],
    queryFn: () => reportService.getFinanceDashboardStats().then((r) => r.data),
  })

export const useAgentDashboardStats = () =>
  useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'agent-dashboard'],
    queryFn: () => reportService.getAgentDashboardStats().then((r) => r.data),
  })

export const useSalesReport = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'sales', params],
    queryFn: () => reportService.getSalesReport(params).then((r) => r.data),
  })

export const useRevenueReport = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'revenue', params],
    queryFn: () => reportService.getRevenueReport(params).then((r) => r.data),
  })

export const useLotteryAdminDashboard = () =>
  useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'lottery-dashboard'],
    queryFn: () => reportService.getDashboardStats().then((r) => r.data),
  })

export const useFinanceDashboard = useFinanceDashboardStats

export const useFinancialReport = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'financial', params],
    queryFn: () => reportService.getFinancialReport(params).then((r) => r.data),
  })
