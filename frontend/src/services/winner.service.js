import api from '../lib/axios'
import { API_ENDPOINTS } from '../lib/constants'

const BASE = API_ENDPOINTS.WINNERS

export const getWinners = (params) => api.get(BASE, { params })
export const getMyWinnings = (params) => api.get(`${BASE}/my`, { params })
export const getWinner = (id) => api.get(`${BASE}/${id}`)
export const getWinnersByEvent = (eventId) => api.get(`${BASE}/event/${eventId}`)
export const getWinnersByDraw = (drawId) => api.get(`${BASE}/draw/${drawId}`)
export const verifyWinner = (id, data) => api.patch(`${BASE}/${id}/verify`, data)
