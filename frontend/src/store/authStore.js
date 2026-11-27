import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS, API_ENDPOINTS } from '../lib/constants'
import api from '../lib/axios'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
          const { user, accessToken } = response.data.data || response.data
          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          })
          return { user, accessToken }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: (skipServerCall = false) => {
        const token = get().accessToken
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
        localStorage.removeItem(STORAGE_KEYS.AUTH)
        if (!skipServerCall && token) {
          api
            .post(
              API_ENDPOINTS.AUTH.LOGOUT,
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
                _skipAuthRetry: true,
              },
            )
            .catch(() => {})
        }
      },

      refreshToken: async () => {
        const response = await api.post(API_ENDPOINTS.AUTH.REFRESH)
        const { accessToken } = response.data.data || response.data
        set({ accessToken })
        return accessToken
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }))
      },

      setLoading: (bool) => set({ isLoading: bool }),

      fetchMe: async () => {
        set({ isLoading: true })
        try {
          const response = await api.get(API_ENDPOINTS.AUTH.ME)
          const user = response.data.data || response.data
          set({ user, isAuthenticated: true, isLoading: false })
          return user
        } catch {
          set({ isLoading: false })
        }
      },

      hasRole: (...roles) => {
        const { user } = get()
        if (!user) return false
        return roles.includes(user.role)
      },

      isAdmin: () => {
        const { user } = get()
        return user?.role === 'superAdmin'
      },
    }),
    {
      name: STORAGE_KEYS.AUTH,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
