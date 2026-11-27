import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as notifService from '../services/notification.service'
import { QUERY_KEYS } from '../lib/constants'

export const useNotifications = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, params],
    queryFn: () => notifService.getMyNotifications(params).then((r) => r.data),
    refetchInterval: 30000, // poll every 30s
  })

export const useUnreadCount = () =>
  useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, 'unread-count'],
    queryFn: () => notifService.getUnreadCount().then((r) => r.data),
    refetchInterval: 15000,
  })

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notifService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] })
    },
  })
}

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notifService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] })
      toast.success('All notifications marked as read')
    },
  })
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notifService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] })
    },
  })
}
