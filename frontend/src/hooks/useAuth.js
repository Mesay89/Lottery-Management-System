import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import * as authService from '../services/auth.service'
import { QUERY_KEYS } from '../lib/constants'

export const useAuth = () => {
  const store = useAuthStore()
  return store
}

export const useLogin = () => {
  const { login } = useAuthStore()
  return useMutation({
    mutationFn: login,
    onError: (error) => {
      toast.error(error.displayMessage || 'Login failed')
    },
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success('Account created successfully! Please login.')
    },
    onError: (error) => {
      toast.error(error.displayMessage || 'Registration failed')
    },
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      toast.success('Password reset link sent to your email')
    },
    onError: (error) => {
      toast.error(error.displayMessage || 'Failed to send reset link')
    },
  })
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, password }) => authService.resetPassword(token, password),
    onSuccess: () => {
      toast.success('Password reset successfully! Please login.')
    },
    onError: (error) => {
      toast.error(error.displayMessage || 'Failed to reset password')
    },
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const { updateUser } = useAuthStore()
  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (response) => {
      const user = response.data.data || response.data
      updateUser(user)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE] })
      toast.success('Profile updated successfully')
    },
    onError: (error) => {
      toast.error(error.displayMessage || 'Failed to update profile')
    },
  })
}
