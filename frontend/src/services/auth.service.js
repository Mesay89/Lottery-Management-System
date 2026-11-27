import api from '../lib/axios'
import { API_ENDPOINTS } from '../lib/constants'

export const login = (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
export const register = (data) => api.post(API_ENDPOINTS.AUTH.REGISTER, data)
export const logout = () => api.post(API_ENDPOINTS.AUTH.LOGOUT)
export const refreshToken = () => api.post(API_ENDPOINTS.AUTH.REFRESH)
export const forgotPassword = (email) => api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
export const resetPassword = (token, password) =>
  api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password })
export const getMe = () => api.get(API_ENDPOINTS.AUTH.ME)
export const updateProfile = (data) => api.put('/auth/profile', data)
export const changePassword = (data) => api.put('/auth/change-password', data)
