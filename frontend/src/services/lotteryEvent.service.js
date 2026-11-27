import api from '../lib/axios'
import { API_ENDPOINTS } from '../lib/constants'

const BASE = API_ENDPOINTS.EVENTS

export const getEvents = (params) => api.get(BASE, { params })
export const getEvent = (id) => api.get(`${BASE}/${id}`)
export const createEvent = (data) => api.post(BASE, data)
export const updateEvent = (id, data) => api.put(`${BASE}/${id}`, data)
export const deleteEvent = (id) => api.delete(`${BASE}/${id}`)
export const approveEvent = (id) => api.patch(`${BASE}/${id}/approve`)
export const openEvent = (id) => api.patch(`${BASE}/${id}/open`)
export const closeEvent = (id) => api.patch(`${BASE}/${id}/close`)
export const cancelEvent = (id) => api.patch(`${BASE}/${id}/cancel`)
export const getEventStats = (id) => api.get(`${BASE}/${id}/stats`)
export const getPublicEvents = (params) => api.get(`${BASE}/public`, { params })
