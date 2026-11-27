import api from '../lib/axios'
import { API_ENDPOINTS } from '../lib/constants'

const BASE = API_ENDPOINTS.USERS

export const getUsers = (params) => api.get(BASE, { params })
export const getUser = (id) => api.get(`${BASE}/${id}`)
export const createUser = (data) => api.post(BASE, data)
export const updateUser = (id, data) => api.put(`${BASE}/${id}`, data)
export const deleteUser = (id) => api.delete(`${BASE}/${id}`)
export const activateUser = (id) => api.patch(`${BASE}/${id}/activate`)
export const suspendUser = (id, reason) => api.patch(`${BASE}/${id}/suspend`, { reason })
export const deactivateUser = (id) => api.patch(`${BASE}/${id}/deactivate`)
export const changeUserRole = (id, role) => api.patch(`${BASE}/${id}/role`, { role })
export const getUserStats = () => api.get(`${BASE}/stats`)
