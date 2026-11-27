import api from '../lib/axios'
import { API_ENDPOINTS } from '../lib/constants'

const BASE = API_ENDPOINTS.AUDIT_LOGS

export const getAuditLogs = (params) => api.get(BASE, { params })
export const getAuditLog = (id) => api.get(`${BASE}/${id}`)
export const getUserAuditLogs = (userId, params) =>
  api.get(`${BASE}/user/${userId}`, { params })
export const exportAuditLogs = (params) =>
  api.get(`${BASE}/export`, { params, responseType: 'blob' })
