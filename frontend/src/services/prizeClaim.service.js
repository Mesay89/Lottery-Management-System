import api from '../lib/axios'
import { API_ENDPOINTS } from '../lib/constants'

const BASE = API_ENDPOINTS.CLAIMS

export const getClaims = (params) => api.get(BASE, { params })
export const getClaim = (id) => api.get(`${BASE}/${id}`)
export const submitClaim = (data) => api.post(BASE, data)
export const getMyClaims = (params) => api.get(`${BASE}/my`, { params })
export const reviewClaim = (id, data) => api.patch(`${BASE}/${id}/review`, data)
export const approveClaim = (id) => api.patch(`${BASE}/${id}/approve`)
export const rejectClaim = (id, data) => api.patch(`${BASE}/${id}/reject`, data)
export const markClaimPaid = (id, data) => api.patch(`${BASE}/${id}/paid`, data)
