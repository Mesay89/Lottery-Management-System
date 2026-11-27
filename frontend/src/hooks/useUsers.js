import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as userService from '../services/user.service'
import { QUERY_KEYS } from '../lib/constants'

export const useUsers = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.USERS, params],
    queryFn: () => userService.getUsers(params).then((r) => r.data),
  })

export const useUser = (id) =>
  useQuery({
    queryKey: [QUERY_KEYS.USERS, id],
    queryFn: () => userService.getUser(id).then((r) => r.data),
    enabled: !!id,
  })

export const useUserStats = () =>
  useQuery({
    queryKey: [QUERY_KEYS.USERS, 'stats'],
    queryFn: () => userService.getUserStats().then((r) => r.data),
  })

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] })
      toast.success('User created successfully')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to create user'),
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] })
      toast.success('User updated successfully')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to update user'),
  })
}

export const useActivateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userService.activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] })
      toast.success('User activated')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to activate user'),
  })
}

export const useSuspendUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }) => userService.suspendUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] })
      toast.success('User suspended')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to suspend user'),
  })
}

export const useDeactivateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userService.deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] })
      toast.success('User deactivated')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to deactivate user'),
  })
}

export const useChangeUserRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }) => userService.changeUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] })
      toast.success('User role changed')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to change role'),
  })
}
