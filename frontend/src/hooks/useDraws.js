import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as drawService from '../services/draw.service'
import { QUERY_KEYS } from '../lib/constants'

export const useDraws = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.DRAWS, params],
    queryFn: () => drawService.getDraws(params).then((r) => r.data),
  })

export const useDraw = (id) =>
  useQuery({
    queryKey: [QUERY_KEYS.DRAWS, id],
    queryFn: () => drawService.getDraw(id).then((r) => r.data),
    enabled: !!id,
  })

export const useDrawsByEvent = (eventId) =>
  useQuery({
    queryKey: [QUERY_KEYS.DRAWS, 'event', eventId],
    queryFn: () => drawService.getDrawsByEvent(eventId).then((r) => r.data),
    enabled: !!eventId,
  })

export const useScheduleDraw = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: drawService.scheduleDraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRAWS] })
      toast.success('Draw scheduled successfully')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to schedule draw'),
  })
}

export const useStartDraw = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: drawService.startDraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRAWS] })
      toast.success('Draw started')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to start draw'),
  })
}

export const useCompleteDraw = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (arg) => {
      const id = typeof arg === 'string' ? arg : arg.id
      const data = typeof arg === 'object' ? arg.data : undefined
      return drawService.completeDraw(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRAWS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RESULTS] })
      toast.success('Draw completed and winners identified!')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to complete draw'),
  })
}

export const useCancelDraw = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: drawService.cancelDraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRAWS] })
      toast.success('Draw cancelled')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to cancel draw'),
  })
}
