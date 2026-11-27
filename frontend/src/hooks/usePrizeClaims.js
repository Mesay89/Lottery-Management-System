import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as claimService from '../services/prizeClaim.service'
import { QUERY_KEYS } from '../lib/constants'

export const usePrizeClaims = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.CLAIMS, params],
    queryFn: () => claimService.getClaims(params).then((r) => r.data),
  })

export const useMyClaims = (params) =>
  useQuery({
    queryKey: [QUERY_KEYS.CLAIMS, 'my', params],
    queryFn: () => claimService.getMyClaims(params).then((r) => r.data),
  })

export const useClaim = (id) =>
  useQuery({
    queryKey: [QUERY_KEYS.CLAIMS, id],
    queryFn: () => claimService.getClaim(id).then((r) => r.data),
    enabled: !!id,
  })

export const useSubmitClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: claimService.submitClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] })
      toast.success('Prize claim submitted successfully!')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to submit claim'),
  })
}

export const useApproveClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: claimService.approveClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] })
      toast.success('Claim approved')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to approve claim'),
  })
}

export const useRejectClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }) => claimService.rejectClaim(id, { rejectionReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] })
      toast.success('Claim rejected')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to reject claim'),
  })
}

export const useReviewClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }) => claimService.reviewClaim(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] })
      toast.success('Claim marked under review')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to review claim'),
  })
}

export const useMarkClaimPaid = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data, paymentReference }) =>
      claimService.markClaimPaid(id, data || { paymentReference }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] })
      toast.success('Claim marked as paid!')
    },
    onError: (error) => toast.error(error.displayMessage || 'Failed to update claim'),
  })
}
export const useMarkClaimAsPaid = useMarkClaimPaid
