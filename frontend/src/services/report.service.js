import api from '../lib/axios'
import { API_ENDPOINTS } from '../lib/constants'

const BASE = API_ENDPOINTS.REPORTS

export const getSalesReport = (params) => api.get(`${BASE}/sales`, { params })
export const getRevenueReport = (params) => api.get(`${BASE}/revenue`, { params })
export const getWinnersReport = (params) => api.get(`${BASE}/winners`, { params })
export const getDashboardStats = () => api.get(`${BASE}/dashboard`)
export const getAdminDashboardStats = () => api.get(`${BASE}/admin-dashboard`)
export const getFinanceDashboardStats = () => api.get(`${BASE}/finance-dashboard`)
export const getAgentDashboardStats = () => api.get(`${BASE}/agent-dashboard`)
export const exportReport = (type, params) =>
  api.get(`${BASE}/export/${type}`, { params, responseType: 'blob' })
export const exportCSV = (params) => api.get(`${BASE}/export/csv`, { params, responseType: 'blob' })
export const exportPDF = (params) => api.get(`${BASE}/export/pdf`, { params, responseType: 'blob' })
export const getFinancialReport = (params) => api.get(`${BASE}/financial`, { params })
