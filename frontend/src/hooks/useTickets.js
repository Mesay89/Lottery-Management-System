import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as ticketService from '../services/ticket.service'
import { QUERY_KEYS } from '../lib/constants'

export const useTickets = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.TICKETS, params],
    queryFn: () => ticketService.getTickets(params).then((r) => r.data),
  })

export const useMyTickets = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.TICKETS, 'my', params],
    queryFn: () => ticketService.getMyTickets(params).then((r) => r.data),
    refetchInterval: 15000,
  })

export const useTicket = (id) =>
  useQuery({
    queryKey: [QUERY_KEYS.TICKETS, id],
    queryFn: () => ticketService.getTicket(id).then((r) => r.data),
    enabled: !!id,
  })

export const usePurchaseTicket = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ticketService.purchaseTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TICKETS] })
      toast.success('Ticket purchased successfully!')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to purchase ticket'),
  })
}
export const useRegisterTicket = usePurchaseTicket

export const useVerifyTicket = () =>
  useMutation({
    mutationFn: ticketService.verifyTicket,
    onError: (error) => toast.error(error.displayMessage || 'Failed to verify ticket'),
  })

export const useCancelTicket = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ticketService.cancelTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TICKETS] })
      toast.success('Ticket cancelled')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to cancel ticket'),
  })
}
