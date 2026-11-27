import api from '../lib/axios'
import { API_ENDPOINTS } from '../lib/constants'

const BASE = API_ENDPOINTS.NOTIFICATIONS

export const getNotifications = (params) => api.get(BASE, { params })
export const getMyNotifications = (params) => api.get(`${BASE}/my`, { params })
export const markAsRead = (id) => api.patch(`${BASE}/${id}/read`)
export const markAllAsRead = () => api.patch(`${BASE}/read-all`)
export const deleteNotification = (id) => api.delete(`${BASE}/${id}`)
export const getUnreadCount = () => api.get(`${BASE}/unread-count`)
