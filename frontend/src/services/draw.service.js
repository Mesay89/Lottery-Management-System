import api from '../lib/axios'
import { API_ENDPOINTS } from '../lib/constants'

const BASE = API_ENDPOINTS.DRAWS

export const getDraws = (params) => api.get(BASE, { params })
export const getDraw = (id) => api.get(`${BASE}/${id}`)
export const scheduleDraw = (data) => api.post(BASE, data)
export const updateDraw = (id, data) => api.put(`${BASE}/${id}`, data)
export const startDraw = (id) => api.patch(`${BASE}/${id}/start`)
export const completeDraw = (id, data) => api.patch(`${BASE}/${id}/complete`, data)
export const cancelDraw = (id) => api.patch(`${BASE}/${id}/cancel`)
export const getDrawsByEvent = (eventId) => api.get(`${BASE}/event/${eventId}`)
