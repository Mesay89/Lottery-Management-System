import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as txService from '../services/transaction.service'
import { QUERY_KEYS } from '../lib/constants'

export const useTransactions = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, params],
    queryFn: () => txService.getTransactions(params).then((r) => r.data),
  })

export const useMyTransactions = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, 'my', params],
    queryFn: () => txService.getMyTransactions(params).then((r) => r.data),
  })

export const useTransaction = (id) =>
  useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, id],
    queryFn: () => txService.getTransaction(id).then((r) => r.data),
    enabled: !!id,
  })

export const useTransactionStats = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, 'stats', params],
    queryFn: () => txService.getTransactionStats(params).then((r) => r.data),
  })

export const useInitiatePayment = () =>
  useMutation({
    mutationFn: txService.initiatePayment,
    onError: (error) => toast.error(error.displayMessage || 'Payment initiation failed'),
  })

export const useVerifyPayment = (id) =>
  useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, id, 'verify'],
    queryFn: () => txService.verifyPayment(id).then((r) => r.data),
    enabled: !!id,
    refetchInterval: 3000,
  })
