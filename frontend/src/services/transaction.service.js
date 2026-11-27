import api from '../lib/axios'
import { API_ENDPOINTS } from '../lib/constants'

const BASE = API_ENDPOINTS.TRANSACTIONS

export const getTransactions = (params) => api.get(BASE, { params })
export const getTransaction = (id) => api.get(`${BASE}/${id}`)
export const getMyTransactions = (params) => api.get(`${BASE}/my`, { params })
export const initiatePayment = (data) => api.post(`${BASE}/initiate`, data)
const multipartConfig = (data) =>
  data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined

export const initiateTelebirr = (data) => api.post(`${BASE}/telebirr/initiate`, data, multipartConfig(data))
export const initiateCBE = (data) => api.post(`${BASE}/cbe/initiate`, data, multipartConfig(data))
export const verifyPayment = (id, data) => api.post(`${BASE}/${id}/verify`, data)
export const getTransactionStats = (params) => api.get(`${BASE}/stats`, { params })
export const refundTransaction = (id) => api.post(`${BASE}/${id}/refund`)
