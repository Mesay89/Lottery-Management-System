import api from '../lib/axios'
import { API_ENDPOINTS } from '../lib/constants'

const BASE = API_ENDPOINTS.RESULTS

export const getResults = (params) => api.get(BASE, { params })
export const getResult = (id) => api.get(`${BASE}/${id}`)
export const publishResult = (id) => api.post(`${BASE}/${id}/publish`)
export const getPublicResults = (params) => api.get(BASE, { params: { ...params, status: 'Published' } })
export const checkTicketResult = (ticketNumber) =>
  api.post(`${API_ENDPOINTS.TICKETS}/verify`, { ticketNumber })
