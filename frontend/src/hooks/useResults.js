import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as resultService from '../services/result.service'
import { QUERY_KEYS } from '../lib/constants'

export const useResults = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.RESULTS, params],
    queryFn: () => resultService.getResults(params).then((r) => r.data),
  })

export const usePublicResults = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.RESULTS, 'public', params],
    queryFn: () => resultService.getPublicResults(params).then((r) => r.data),
  })

export const useResult = (id) =>
  useQuery({
    queryKey: [QUERY_KEYS.RESULTS, id],
    queryFn: () => resultService.getResult(id).then((r) => r.data),
    enabled: !!id,
  })

export const usePublishResult = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: resultService.publishResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RESULTS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS] })
      toast.success('Results published successfully!')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to publish results'),
  })
}

export const useCheckTicketResult = () =>
  useMutation({
    mutationFn: resultService.checkTicketResult,
    onError: (error) => toast.error(error.displayMessage || 'Failed to check ticket'),
  })
