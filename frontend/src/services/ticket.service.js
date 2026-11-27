import api from '../lib/axios'
import { API_ENDPOINTS } from '../lib/constants'

const BASE = API_ENDPOINTS.TICKETS

export const getTickets = (params) => api.get(BASE, { params })
export const getTicket = (id) => api.get(`${BASE}/${id}`)
export const purchaseTicket = (data) => api.post(BASE, data)
export const getMyTickets = (params) => api.get(`${BASE}/my`, { params })
export const verifyTicket = (ticketNumber) => api.post(`${BASE}/verify`, { ticketNumber })
export const cancelTicket = (id) => api.patch(`${BASE}/${id}/cancel`)
export const getTicketReceipt = (id) => api.get(`${BASE}/${id}/receipt`)
export const downloadReceipt = (id) => api.get(`${BASE}/${id}/receipt`, { responseType: 'blob' })
export const bulkPurchase = (data) => api.post(`${BASE}/bulk`, data)
