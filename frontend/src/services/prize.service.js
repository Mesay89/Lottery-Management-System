import api from '../lib/axios'
import { API_ENDPOINTS } from '../lib/constants'

const BASE = API_ENDPOINTS.PRIZES

export const getPrizes = (params) => api.get(BASE, { params })
export const getPrize = (id) => api.get(`${BASE}/${id}`)
export const createPrize = (data) => api.post(BASE, data)
export const updatePrize = (id, data) => api.put(`${BASE}/${id}`, data)
export const deletePrize = (id) => api.delete(`${BASE}/${id}`)
export const getPrizesByEvent = (eventId) => api.get(`${BASE}/event/${eventId}`)
