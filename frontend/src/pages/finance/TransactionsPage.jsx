import { useState } from 'react'
import { Download, CheckCircle2, XCircle, Eye } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useTransactions } from '../../hooks/useTransactions'
import Table from '../../components/ui/Table'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Badge, { getStatusVariant } from '../../components/ui/Badge'
import { formatCurrency, formatDateTime } from '../../lib/utils'
import { exportCSV, exportPDF } from '../../services/report.service'
import { verifyPayment } from '../../services/transaction.service'
import toast from 'react-hot-toast'

export default function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [status, setStatus] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [reviewTxn, setReviewTxn] = useState(null)
  const [rejectTxn, setRejectTxn] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useTransactions({
    page,
    limit: 15,
    paymentMethod: paymentMethod || undefined,
    status: status || undefined,
  })

  const handleApprove = async (id) => {
    setUpdatingId(id)
    try {
      await verifyPayment(id, { status: 'Completed' })
      toast.success('Payment approved and ticket activated!')
      setReviewTxn(null)
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    } catch (err) {
      toast.error(err.displayMessage || 'Failed to approve payment')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRejectSubmit = async (e) => {
    e.preventDefault()
    if (!rejectTxn) return
    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason')
      return
    }
    setUpdatingId(rejectTxn._id)
    try {
      await verifyPayment(rejectTxn._id, {
        status: 'Failed',
        failureReason: rejectionReason.trim(),
      })
      toast.success('Payment rejected and ticket cancelled.')
      setRejectTxn(null)
      setReviewTxn(null)
      setRejectionReason('')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    } catch (err) {
      toast.error(err.displayMessage || 'Failed to reject payment')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleExport = async (fmt) => {
    try {
      const fn = fmt === 'csv' ? exportCSV : exportPDF
      const res = await fn({ type: 'transactions' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.setAttribute('download', `transactions-report.${fmt}`)
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch {
      toast.error('Export failed')
    }
  }

  const getProofUrl = (t) => t.screenshotUrl || t.metadata?.screenshotUrl
  const getProofRef = (t) => t.externalRef || t.telebirrRef || t.cbeRef || t.metadata?.submittedRef

  const columns = [
    { key: 'transactionRef', header: 'Reference', render: (t) => <span className="font-mono text-xs font-semibold">{t.transactionRef}</span> },
    {
      key: 'proof',
      header: 'Payment Proof',
      render: (t) => {
        const ref = getProofRef(t)
        const screenshot = getProofUrl(t)
        const sender = t.metadata?.senderPhone
        return (ref || screenshot || sender) ? (
          <div className="text-xs space-y-1">
            {ref && <div className="font-mono font-medium text-slate-900 dark:text-white">ID: {ref}</div>}
            {sender && <div className="text-slate-500">From: {sender}</div>}
            {screenshot && (
              <button
                type="button"
                onClick={() => setReviewTxn(t)}
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <Eye className="w-3.5 h-3.5" /> View Screenshot
              </button>
            )}
          </div>
        ) : '—'
      },
    },
    { key: 'customer', header: 'Customer', render: (t) => t.customer ? `${t.customer.firstName} ${t.customer.lastName}` : '—' },
    { key: 'paymentMethod', header: 'Provider', render: (t) => <span className="uppercase text-xs font-bold">{t.paymentMethod}</span> },
    { key: 'amount', header: 'Amount', render: (t) => <span className="font-semibold">{formatCurrency(t.amount)}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (t) => (
        <div className="space-y-1">
          <Badge variant={getStatusVariant(t.status)}>{t.status}</Badge>
          {t.status === 'Failed' && t.failureReason && (
            <div className="text-[11px] text-rose-600 max-w-[180px] truncate" title={t.failureReason}>
              {t.failureReason}
            </div>
          )}
        </div>
      ),
    },
    { key: 'createdAt', header: 'Date', render: (t) => formatDateTime(t.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      render: (t) => t.status === 'Pending' ? (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setReviewTxn(t)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            <Eye className="w-3.5 h-3.5" /> Review
          </button>
          <button
            type="button"
            disabled={updatingId === t._id}
            onClick={() => handleApprove(t._id)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
          </button>
          <button
            type="button"
            disabled={updatingId === t._id}
            onClick={() => { setRejectTxn(t); setRejectionReason('') }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
        </div>
      ) : '—',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Transactions</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleExport('csv')}><Download className="w-4 h-4" /> CSV</Button>
          <Button variant="secondary" size="sm" onClick={() => handleExport('pdf')}><Download className="w-4 h-4" /> PDF</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="w-48">
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            placeholder="All Providers"
            options={[
              { value: 'telebirr', label: 'Telebirr' },
              { value: 'cbe', label: 'CBE Birr' },
              { value: 'cash', label: 'Cash' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
            ]}
          />
        </div>
        <div className="w-48">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="All Statuses"
            options={[
              { value: 'Completed', label: 'Completed' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Failed', label: 'Failed' },
              { value: 'Refunded', label: 'Refunded' },
            ]}
          />
        </div>
      </div>

      <Table columns={columns} data={data?.data || []} isLoading={isLoading} pagination={data?.pagination} onPageChange={setPage} />

      <Modal
        isOpen={!!reviewTxn}
        onClose={() => setReviewTxn(null)}
        title={`Review Payment Proof — ${reviewTxn?.transactionRef || ''}`}
        size="md"
      >
        {reviewTxn && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
              <div>
                <p className="text-xs text-slate-500">Customer</p>
                <p className="font-medium">{reviewTxn.customer ? `${reviewTxn.customer.firstName} ${reviewTxn.customer.lastName}` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Amount</p>
                <p className="font-semibold text-emerald-700">{formatCurrency(reviewTxn.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Provider / Receiver</p>
                <p className="font-medium uppercase">{reviewTxn.paymentMethod} ({reviewTxn.metadata?.receiverAccount || '—'})</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Sender Phone / Account</p>
                <p className="font-mono font-medium">{reviewTxn.metadata?.senderPhone || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500">Submitted Transaction ID</p>
                <p className="font-mono font-semibold">{getProofRef(reviewTxn) || 'Not provided (see screenshot)'}</p>
              </div>
            </div>

            {getProofUrl(reviewTxn) ? (
              <div className="rounded-xl border border-slate-200 p-2 bg-slate-50">
                <img
                  src={getProofUrl(reviewTxn)}
                  alt="Customer payment screenshot"
                  className="max-h-96 mx-auto rounded object-contain"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                No screenshot uploaded. Verify using the Transaction ID above.
              </div>
            )}

            {reviewTxn.status === 'Pending' && (
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => { setRejectTxn(reviewTxn); setRejectionReason('') }}
                  disabled={updatingId === reviewTxn._id}
                >
                  Reject with Reason
                </Button>
                <Button
                  onClick={() => handleApprove(reviewTxn._id)}
                  loading={updatingId === reviewTxn._id}
                >
                  Approve Payment
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!rejectTxn}
        onClose={() => setRejectTxn(null)}
        title="Reject Payment Proof"
        size="sm"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Provide a reason for rejecting <span className="font-mono font-semibold">{rejectTxn?.transactionRef}</span>. The linked ticket will be cancelled.
          </p>
          <Input
            label="Rejection Reason"
            placeholder="e.g. Invalid transaction ID, amount mismatch, unclear screenshot"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setRejectTxn(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={updatingId === rejectTxn?._id} className="bg-rose-600 hover:bg-rose-700 text-white">
              Confirm Reject
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
