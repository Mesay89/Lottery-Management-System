import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as eventService from '../services/lotteryEvent.service'
import { QUERY_KEYS } from '../lib/constants'

export const useLotteryEvents = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.EVENTS, params],
    queryFn: () => eventService.getEvents(params).then((r) => r.data),
  })
export const useEvents = useLotteryEvents

export const usePublicEvents = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.EVENTS, 'public', params],
    queryFn: () => eventService.getPublicEvents(params).then((r) => r.data),
  })

export const useLotteryEvent = (id) =>
  useQuery({
    queryKey: [QUERY_KEYS.EVENTS, id],
    queryFn: () => eventService.getEvent(id).then((r) => r.data),
    enabled: !!id,
  })

export const useEventStats = (id) =>
  useQuery({
    queryKey: [QUERY_KEYS.EVENTS, id, 'stats'],
    queryFn: () => eventService.getEventStats(id).then((r) => r.data),
    enabled: !!id,
  })

export const useCreateEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eventService.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS] })
      toast.success('Event created successfully')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to create event'),
  })
}

export const useUpdateEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => eventService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS] })
      toast.success('Event updated successfully')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to update event'),
  })
}

export const useDeleteEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eventService.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS] })
      toast.success('Event deleted')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to delete event'),
  })
}

export const useApproveEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eventService.approveEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS] })
      toast.success('Event approved')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to approve event'),
  })
}

export const useOpenEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eventService.openEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS] })
      toast.success('Event is now open for ticket sales')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to open event'),
  })
}

export const useCloseEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eventService.closeEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS] })
      toast.success('Event closed')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to close event'),
  })
}

export const useCancelEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eventService.cancelEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS] })
      toast.success('Event cancelled')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to cancel event'),
  })
}
